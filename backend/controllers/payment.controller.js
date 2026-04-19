import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import { createNotification } from "../services/notification.service.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Course from "../models/Course.js";
import { createGatewayPayment } from "../services/payment.service.js";
import crypto from "crypto";

export async function createPayment(req, res) {
    try {
        const { method } = req.body;

        // 🛒 1. هات الكارت
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        // 🎯 2. هات IDs
        const courseIds = cart.items.map((item) => item.course);

        // 📚 3. هات الكورسات من DB
        const courses = await Course.find({ _id: { $in: courseIds } });

        // 💰 4. احسب السعر الحقيقي
        const amount = courses.reduce((sum, course) => {
            return sum + (course.discountPrice || course.price);
        }, 0);

        // 💳 5. إنشاء الدفع
        const gateway = await createGatewayPayment({ method, amount });

        // 🧾 6. إنشاء order
        const order = await Order.create({
            user: req.user._id,
            courses: courseIds,
            amount,
            method,
            status: "pending",
            gatewayReference:
                gateway.orderId || gateway.id || gateway.reference || "",
        });

        return res.status(201).json({
            success: true,
            order,
            gateway,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Payment failed",
        });
    }

}

export async function confirmPayment(req, res) {
    try {
        const { orderId } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        }).populate("courses");


        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.status === "paid") {
            return res.json({
                success: true,
                message: "Already confirmed",
            });
        }

        // ✅ تحديث الحالة
        order.status = "paid";
        await order.save();

        // 🎓 تسجيل المستخدم
        await Promise.all(
            order.courses.map(async (course) => {
                const exists = await Enrollment.findOne({
                    user: order.user,
                    course: course._id,
                });

                if (!exists) {
                    await Enrollment.create({
                        user: order.user,
                        course: course._id,
                    });

                    await Course.findByIdAndUpdate(course._id, {
                        $inc: { enrolledCount: 1 },
                    });

                    await User.findByIdAndUpdate(order.user, {
                        $addToSet: { enrolledCourses: course._id },
                    });
                }
            })
        );

        // 🔔 notification
        await createNotification({
            user: order.user,
            title: "تم الدفع بنجاح 💰",
            message: `تم تسجيلك في ${order.courses.length} كورس`,
            type: "payment",
        });

        await Promise.all(
            order.courses.map((course) =>
                createNotification({
                    user: course.instructor,
                    title: "تم بيع كورس 🎉",
                    message: `تم بيع كورس ${course.title}`,
                    type: "sales",
                })
            )
        );

        // 🧹 مسح الكارت
        await Cart.findOneAndUpdate(
            { user: order.user },
            { items: [] }
        );

        return res.json({
            success: true,
            message: "Payment confirmed successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Payment confirmation failed",
        });
    }
}
function verifyHmac(data, hmac, secret) {
    const string =
        data.amount_cents +
        data.created_at +
        data.currency +
        data.error_occured +
        data.has_parent_transaction +
        data.id +
        data.integration_id +
        data.is_3d_secure +
        data.is_auth +
        data.is_capture +
        data.is_refunded +
        data.is_standalone_payment +
        data.is_voided +
        data.order.id +
        data.owner +
        data.pending +
        data.source_data.pan +
        data.source_data.sub_type +
        data.source_data.type +
        data.success;

    const calculated = crypto
        .createHmac("sha512", secret)
        .update(string)
        .digest("hex");

    return calculated === hmac;
}
export async function paymobWebhook(req, res) {
    try {
        const payload = req.body;

        if (!process.env.PAYMOB_HMAC_SECRET) {
            return res.status(500).json({
                success: false,
                message: "HMAC secret not configured",
            });
        }

        const isValid = verifyHmac(
            payload.obj,
            payload.hmac,
            process.env.PAYMOB_HMAC_SECRET
        );

        if (!isValid) {
            return res.status(400).json({ success: false });
        }

        // Paymob data
        const success = payload.obj?.success;
        const orderId = payload.obj?.order?.id;

        if (!success) {
            return res.status(400).json({ success: false });
        }

        if (!orderId) {
            return res.status(400).json({ success: false });
        }

        // 🔥 هنا لازم تربط Paymob orderId بالـ order عندك
        const order = await Order.findOne({
            gatewayReference: orderId,
        }).populate("courses");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.status === "paid") {
            return res.json({
                success: true,
                message: "Already processed",
            });
        }

        // نفس confirmPayment logic 👇
        order.status = "paid";
        await order.save();

        await Promise.all(
            order.courses.map(async (course) => {
                const exists = await Enrollment.findOne({
                    user: order.user,
                    course: course._id,
                });

                if (!exists) {
                    await Enrollment.create({
                        user: order.user,
                        course: course._id,
                    });

                    await Course.findByIdAndUpdate(course._id, {
                        $inc: { enrolledCount: 1 },
                    });

                    await User.findByIdAndUpdate(order.user, {
                        $addToSet: { enrolledCourses: course._id },
                    });
                }
            })
        );

        await createNotification({
            user: order.user,
            title: "تم الدفع بنجاح 💰",
            message: `تم تسجيلك في ${order.courses.length} كورس`,
            type: "payment",
        });

        await Promise.all(
            order.courses.map((course) =>
                createNotification({
                    user: course.instructor,
                    title: "تم بيع كورس 🎉",
                    message: `تم بيع كورس ${course.title}`,
                    type: "sales",
                })
            )
        );

        await Cart.findOneAndUpdate(
            { user: order.user },
            { items: [] }
        );

        return res.json({ success: true });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Webhook failed",
        });
    }
}


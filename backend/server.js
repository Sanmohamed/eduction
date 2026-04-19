const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


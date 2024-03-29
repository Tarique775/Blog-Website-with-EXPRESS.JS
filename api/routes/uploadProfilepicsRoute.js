const express = require('express');
const { isAuth } = require('../middleware/authentication');
const upload = require('../middleware/multerFileUpload');
const postUpload = require('../middleware/postMulterUpload');
const {
    uploadProfilePics,
    removeProfilePics,
    postImageController,
} = require('../controllers/uploadProfilePicController/uploadProfilepicController');

const route = express.Router();

route.post('/profilePics', isAuth, upload.single('profilePics'), uploadProfilePics);

route.post('/removeProfilePics', isAuth, removeProfilePics);

route.post('/postimage', isAuth, postUpload.single('post-image'), postImageController);

module.exports = route;

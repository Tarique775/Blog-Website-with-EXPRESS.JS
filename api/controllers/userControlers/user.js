const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const { errorFormetter } = require('./userValidation');
const { errorFormet } = require('./loginValidator');

exports.getRegister = (req, res, next) => {
    res.render('pages/user/register', {
        error: {},
        value: {},
        success: '',
        page_name: 'register',
    });
};

exports.postRegister = async (req, res, next) => {
    const {
 userName, email, password, confirmPassword, } = req.body;

    const errors = validationResult(req).formatWith(errorFormetter);
    if (!errors.isEmpty()) {
        return res.render('pages/user/register', {
            error: errors.mapped(),
            value: {
                userName,
                email,
                password,
                confirmPassword,
            },
            success: '',
            page_name: 'register',
        });
    }

    try {
        const user = new User({
            userName,
            email,
            password,
            confirmPassword,
        });
        const newUser = await user.save();
        if (newUser) {
            res.redirect('/user/login');
        }
        console.log('successfull', newUser);
    } catch (err) {
        next(err);
    }
};

exports.getLogin = (req, res, next) => {
    res.render('pages/user/login', {
        error: {},
        value: {},
        Email: '',
        Password: '',
        page_name: 'login',
    });
};

exports.postLogin = async (req, res, next) => {
    const errors = validationResult(req).formatWith(errorFormet);
    if (!errors.isEmpty()) {
        return res.render('pages/user/login', {
            error: errors.mapped(),
            Email: '',
            Password: '',
            page_name: 'login',
        });
    }
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.render('pages/user/login', {
                error: {},
                value: {},
                Email: 'Invalid Credential',
                Password: '',
                page_name: 'login',
            });
        }
        const isMatch = await user.matchPassword(password);
        console.log(isMatch);
        if (!isMatch) {
            return res.render('pages/user/login', {
                error: {},
                value: {},
                Email: '',
                Password: 'Invalid Credentials',
                page_name: 'login',
            });
        }
        const token = await user.getAuthToken();
        console.log(token);
        const cookie = res.cookie(process.env.SET_COOKIE, token, {
            maxAge: process.env.JWT_EXPIRY,
            httpOnly: true,
            signed: true,
        });
        console.log(cookie);
        res.redirect('/dashbord');
        // res.redirect('/');
        // res.render('/user/login');
    } catch (e) {
        next(e);
    }
};

exports.postLogout = async (req, res, next) => {
    try {
        req.user.tokens = [];
        res.clearCookie(process.env.SET_COOKIE);
        await req.user.save();
        res.redirect('/user/login');
    } catch (e) {
        next(e);
    }
};

exports.getChangePassword = (req, res, next) => {
    res.render('pages/user/changePassword', {
        error: {},
        value: {},
        success: '',
        page_name: 'changePassword',
    });
};

exports.postChangePassword = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const errors = validationResult(req).formatWith(errorFormet);
    if (!errors.isEmpty()) {
        return res.render('pages/user/changePassword', {
            error: errors.mapped(),
            oldPassword,
            newPassword,
            confirmPassword,
            success: '',
            value: {},
            page_name: 'changePassword',
        });
    }

    try {
        await bcrypt.compare(oldPassword, req.user.password);

        const hash = await bcrypt.hash(newPassword, 12);

        const chngPass = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { password: hash } },
            { new: true }
        );
        if (chngPass) {
            return res.redirect('/user/logout');
        }
    } catch (e) {
        next(e);
    }
};

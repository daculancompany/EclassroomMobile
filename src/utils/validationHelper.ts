import * as Yup from 'yup';

const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 4 characters')
        .required('Password is required'),
});

const productValidationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    barcode: Yup.string().required('Barcode is required'),
    category_id: Yup.string().required('Category is required'),
    price: Yup.number()
        .typeError('Price must be a number')
        .positive('Price must be greater than zero')
        .required('Price is required'),
    stock: Yup.number()
        .typeError('Quantity must be a number')
        .required('Description is required'),
    description: Yup.string().required('Description is required'),
});

export {loginValidationSchema, productValidationSchema};

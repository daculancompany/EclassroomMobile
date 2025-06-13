import React, {useState, useRef, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet, Keyboard, Alert} from 'react-native';
import {useTheme, Appbar, Menu} from 'react-native-paper';
import useProductStore from '../../states/productState';
import {
    MainContainer,
    ButtonComponent,
    TextInputComponent,
    TextComponent,
} from '../../components/';
import {Formik} from 'formik';
import {productValidationSchema} from '../../utils/validationHelper';
import useCategories from '../../hooks/useCategories';
import {ERROR_COLOR} from '../../utils/constant';
import { useIsFocused } from '@react-navigation/native';

const NewProduct = ({route}) => {
    const product = route?.params?.product ?? null;
    const isFocused = useIsFocused();
    const {setLoading, loading, storeProduct, updateProduct} =
        useProductStore();
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(true);
    const {data: categories} = useCategories();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);

    const nameRef = useRef();
    const barcodeRef = useRef();
    const priceRef = useRef();
    const stockRef = useRef();
    const descriptionRef = useRef();
    const formikRef = useRef();

    useEffect(() => {
        if (product) {
            setSelectedCategory(product?.category);
            const {name, barcode, category_id, price, stock, description} =
                product;

            formikRef?.current?.setFieldValue('name', name);
            formikRef?.current?.setFieldValue('barcode', barcode);
            formikRef?.current?.setFieldValue('category_id', category_id);
            formikRef?.current?.setFieldValue('price', String(price));
            formikRef?.current?.setFieldValue('stock', String(stock));
            formikRef?.current?.setFieldValue('description', description);
            setTimeout(() => {
                formikRef?.current?.setErrors({});
            }, 300);
        }
    }, [product]);

    const submitForm = async (values, resetForm) => {
        setLoading(true);
        Keyboard.dismiss();
        product ? (values.id = product?.id) : '';
        const response = await (product ? updateProduct : storeProduct)(values);
        if (!response?.error) {
            resetForm();
            setSelectedCategory(null);
            Alert.alert(
                'Success',
                'Product successfully saved!',
                [{text: 'OK', onPress: () => navigation.pop()}],
                {cancelable: false},
            );
        } else {
            console.log('Login failed with status:');
        }
        setLoading(false);
    };

    if (!modalVisible) return null;

    // useEffect(() => {
    //     setTimeout(() => {
    //         nameRef.current?.focus();
    //     }, 300);
    // }, []);

    return (
        <>
            {/* Appbar with Back Button */}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.pop()} />
                <Appbar.Content title="Add Product" />
            </Appbar.Header>
            <MainContainer>
                <Formik
                    innerRef={formikRef}
                    validationSchema={productValidationSchema}
                    initialValues={{
                        name: '',
                        barcode: '',
                        price: '',
                        stock: '',
                        description: '',
                        category_id: '',
                    }}
                    onSubmit={(values, {resetForm}) => {
                        console.log('Submitted values:', values);
                        submitForm(values, resetForm);
                    }}>
                    {({
                        setFieldValue,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        isValid,
                    }) => (
                        //console.log({errors}),
                        <>
                            <Menu
                                visible={menuVisible}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={
                                    <ButtonComponent
                                        mode="outlined"
                                        label={
                                            selectedCategory
                                                ? selectedCategory.name
                                                : 'Select Category'
                                        }
                                        onPress={() => {
                                            setMenuVisible(true);
                                        }}
                                    />
                                }>
                                {categories?.map(category => (
                                    <Menu.Item
                                        key={category.id}
                                        onPress={() => {
                                            setFieldValue(
                                                'category_id',
                                                category.id,
                                            );
                                            setSelectedCategory(category);
                                            setMenuVisible(false);
                                        }}
                                        title={category.name}
                                    />
                                ))}
                            </Menu>
                            {errors && errors.category_id && (
                                <TextComponent style={{color: ERROR_COLOR}}>
                                    {errors.category_id}
                                </TextComponent>
                            )}
                            <TextInputComponent
                                label="Name"
                                onChangeText={handleChange('name')}
                                onBlur={handleBlur('name')}
                                value={values.name}
                                error={errors.name ? true : false}
                                errorText={errors.name}
                                inputRef={nameRef}
                                returnKeyType="next"
                                onSubmitEditing={() =>
                                    barcodeRef.current?.focus()
                                }
                            />

                            <TextInputComponent
                                label="Barcode"
                                onChangeText={handleChange('barcode')}
                                onBlur={handleBlur('barcode')}
                                value={values.barcode}
                                error={errors.barcode ? true : false}
                                errorText={errors.barcode}
                                inputRef={barcodeRef}
                                returnKeyType="next"
                                onSubmitEditing={() =>
                                    priceRef.current?.focus()
                                }
                            />

                            <TextInputComponent
                                label="Price"
                                onChangeText={handleChange('price')}
                                onBlur={handleBlur('price')}
                                value={values.price}
                                error={errors.price ? true : false}
                                errorText={errors.price}
                                keyboardType="numeric"
                                inputRef={priceRef}
                                returnKeyType="next"
                                onSubmitEditing={() =>
                                    stockRef.current?.focus()
                                }
                            />

                            <TextInputComponent
                                label="Stock"
                                onChangeText={handleChange('stock')}
                                onBlur={handleBlur('stock')}
                                value={values.stock}
                                error={errors.stock ? true : false}
                                errorText={errors.stock}
                                keyboardType="numeric"
                                inputRef={stockRef}
                                returnKeyType="next"
                                onSubmitEditing={() =>
                                    descriptionRef.current?.focus()
                                }
                            />

                            <TextInputComponent
                                inputRef={descriptionRef}
                                label="Description"
                                onChangeText={handleChange('description')}
                                onBlur={handleBlur('description')}
                                value={values.description}
                                error={errors.description ? true : false}
                                errorText={errors.description}
                                multiline={true}
                                numberOfLines={4}
                                returnKeyType="done"
                                blurOnSubmit={true}
                                onSubmitEditing={Keyboard.dismiss}
                            />

                            <ButtonComponent
                                label="Save"
                                onPress={handleSubmit}
                                disabled={loading}
                                loading={loading}
                            />
                        </>
                    )}
                </Formik>
            </MainContainer>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {},
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
});

export default NewProduct;

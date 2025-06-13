import React, {useState, useLayoutEffect, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import {Button, Card, MD3Colors} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {Swipeable} from 'react-native-gesture-handler';
import useProductStore from '../../states/productState';
import useProducts from '../../hooks/useProducts';
import {useIsFocused} from '@react-navigation/native';

const ProductsPage = () => {
    const isFocused = useIsFocused();
    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState([]);
    const {data, isLoading, isFetching, refetch} = useProducts(page);
    const products = data?.data ?? [];
    const hasMore = data?.current_page < data?.last_page;
    const {setLoading} = useProductStore();
    const navigation = useNavigation();
    
    useEffect(() => {
        if (isFocused) {
            setPage(1);
            refetch();
        }
    }, [isFocused]);
    
    useEffect(() => {
        if (products.length) {
            setAllProducts(prev => {
                const map = new Map(prev.map(p => [p.id, p]));
                for (const product of products) {
                    map.set(product.id, product); // update or insert
                }
                return Array.from(map.values());
            });
        }
    }, [data]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    icon="plus"
                    mode="contained"
                    onPress={() => navigation.navigate('NewProduct')}>
                    Create
                </Button>
            ),
        });
    }, [navigation]);

    const deleteProduct = id => {
        Alert.alert('Delete', 'Are you sure you want to delete this product?', [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    // Call delete logic here
                    alert('Product deleted');
                },
            },
        ]);
    };

    const closeSwipe = () => {
        if (swipeableRef.current) {
            swipeableRef.current.close();
        }
    };

    const renderRightActions = useCallback(
        item => (
            <View style={styles.swipeActionContainer}>
                <TouchableOpacity
                    onPress={() => deleteProduct(item?.id)}
                    style={styles.iconButton}>
                    <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('NewProduct', {product: item})
                    }
                    style={styles.iconButton}>
                    <Text style={styles.editText}>✏️</Text>
                </TouchableOpacity>
            </View>
        ),
        [navigation],
    );

    const ProductItem = React.memo(({item}) => {
        const swipeableRef = React.useRef(null);

        const closeSwipe = () => {
            if (swipeableRef.current) {
                swipeableRef.current.close();
            }
        };

        const onDelete = () => {
            closeSwipe();
            deleteProduct(item.id);
        };

        const onEdit = () => {
            closeSwipe();
            navigation.navigate('NewProduct', {product: item});
        };

        const renderRightActions = () => (
            <View style={styles.swipeActionContainer}>
                <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                    <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
                    <Text style={styles.editText}>✏️</Text>
                </TouchableOpacity>
            </View>
        );

        return (
            <Swipeable
                ref={swipeableRef}
                renderRightActions={renderRightActions}>
                <Card style={styles.card}>
                    <Card.Title
                        title={`${item.name} - ${item.price}`}
                        subtitle={`Barcode: ${item.barcode}`}
                        right={() => (
                            <Text style={styles.stockText}>
                                Stock: {item.stock}
                            </Text>
                        )}
                    />
                </Card>
            </Swipeable>
        );
    });

    const renderItem = useCallback(({item}) => <ProductItem item={item} />, []);

    const handleLoadMore = () => {
        if (!isFetching) {
            if (hasMore) {
                setPage(prev => prev + 1);
            } else {
                if (allProducts.length > 0) {
                    Alert.alert(
                        'No more products',
                        'There are no more products to load.',
                    );
                }
            }
        }
    };

    return(
        <> <Text>ProductpAGE</Text> </>
    )

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={allProducts}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            onEndReached={() => handleLoadMore()}
            onEndReachedThreshold={0.5}
            // initialNumToRender={30}
            // maxToRenderPerBatch={5}
            ListFooterComponent={isFetching ? <ActivityIndicator /> : null}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
                !isLoading && (
                    <Text style={styles.empty}>No products found.</Text>
                )
            }
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 10,
    },
    card: {
        marginBottom: 10,
        borderRadius: 10,
    },
    swipeActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: '#fff',
        paddingRight: 10,
        paddingLeft: 10,
        borderRadius: 10,
        height: '85%',
    },
    iconButton: {
        padding: 12,
        marginHorizontal: 5,
        backgroundColor: '#eee',
        borderRadius: 8,
    },
    deleteText: {
        color: MD3Colors.error50,
        fontSize: 18,
    },
    editText: {
        color: MD3Colors.primary50,
        fontSize: 18,
    },
    stockText: {
        marginRight: 10,
        color: 'gray',
        fontWeight: '500',
    },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        color: 'gray',
    },
});

export default ProductsPage;

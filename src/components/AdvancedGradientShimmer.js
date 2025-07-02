import React from 'react';
import {View, StyleSheet} from 'react-native';
import Shimmer from 'react-native-shimmer';
import {useTheme, Card} from 'react-native-paper';

// Reusable shimmer block
const ShimmerBlock = ({height, borderRadius = 8, style}) => {
    const {colors} = useTheme();
    const backgroundColor = colors.surfaceVariant || colors.backdrop;

    return (
        <Shimmer style={style}>
            <View style={{height, borderRadius, backgroundColor}} />
        </Shimmer>
    );
};

// SimpleLoading Component (e.g. profile card shimmer)
export const SimpleLoading = () => {
    return (
        <View style={styles.container}>
            <ShimmerBlock
                height={180}
                borderRadius={12}
                style={styles.cardShimmer}
            />
        </View>
    );
};

// ChatLoading Component (e.g. list of chat bubbles shimmer)
export const ChatLoading = () => {
    return (
        <View style={styles.container}>
            {[1, 2, 3, 4].map(item => (
                <ShimmerBlock
                    key={item}
                    height={70}
                    borderRadius={8}
                    style={styles.listItemShimmer}
                />
            ))}
        </View>
    );
};

export const IconTextIcon = ({count = 4}) => {
    const {colors} = useTheme();
    return (
        <View style={styles.container}>
            {[...Array(count)].map((_, index) => (
                <Card
                    key={index}
                    style={[styles.card]}>
                    <Card.Content style={styles.content}>
                        <Shimmer>
                            <View
                                style={[
                                    styles.iconPlaceholder,
                                ]}
                            />
                        </Shimmer>
                        <View style={styles.textContainer}>
                            <Shimmer>
                                <View
                                    style={[
                                        styles.lineShort,
                                     
                                    ]}
                                />
                            </Shimmer>
                        </View>
                        <Shimmer>
                            <View
                                style={[
                                    styles.iconPlaceholder,
                                   
                                ]}
                            />
                        </Shimmer>
                    </Card.Content>
                </Card>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
         padding: 16,
    },
    cardShimmer: {
        marginBottom: 20,
    },
    listItemShimmer: {
        marginBottom: 12,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    iconPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
        marginRight: 16,
    },
    lineShort: {
        width: '80%',
        height: 15,
        borderRadius: 6,
        marginBottom: 6,
    },
    lineMedium: {
        width: '80%',
        height: 12,
        borderRadius: 6,
        marginBottom: 6,
    },
    lineLong: {
        width: '100%',
        height: 10,
        borderRadius: 6,
    },
});

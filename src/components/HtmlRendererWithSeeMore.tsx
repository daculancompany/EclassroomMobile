import React, {useState, useRef, useEffect} from 'react';
import {View, TouchableOpacity, Text, useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {useTheme} from 'react-native-paper';

const HtmlRendererWithSeeMore = ({htmlContent}) => {
    const {width} = useWindowDimensions();
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const [showSeeMore, setShowSeeMore] = useState(false);
    const containerRef = useRef(null);
    const rendererRef = useRef(null);

    // Configuration
    const numberOfLines = 3;
    const lineHeight = 24; // Must match your actual line height
    const maxCollapsedHeight = numberOfLines * lineHeight;

    const baseStyle = {
        color: theme.colors.text,
        paddingHorizontal: 12,
        fontSize: 16,
        lineHeight: lineHeight,
    };

    // More reliable measurement function
    const checkContentHeight = () => {
        try {
            // Method 1: Try RenderHtml's native measurement first
            if (rendererRef.current) {
                rendererRef.current.measureInWindow((x, y, width, height) => {
                    if (height > maxCollapsedHeight) {
                        setShowSeeMore(true);
                    }
                });
            }
            
            // Method 2: Fallback to container measurement
            if (containerRef.current) {
                containerRef.current.measure((x, y, w, h) => {
                    if (h > maxCollapsedHeight) {
                        setShowSeeMore(true);
                    }
                });
            }
        } catch (error) {
            console.warn('Measurement error:', error);
        }
    };

    // Check height whenever content changes
    useEffect(() => {
        const timer = setTimeout(checkContentHeight, 300); // Allow time for rendering
        return () => clearTimeout(timer);
    }, [htmlContent]);

    return (
        <View ref={containerRef}>
            <View style={{
                overflow: 'hidden',
                maxHeight: expanded ? undefined : maxCollapsedHeight
            }}>
                <RenderHtml
                    ref={rendererRef}
                    source={{html: htmlContent || ''}}
                    contentWidth={width}
                    tagsStyles={{
                        body: baseStyle,
                        p: {...baseStyle, marginBottom: 12},
                        // ... keep your other tag styles
                    }}
                    baseStyle={{
                        paddingHorizontal: 10,
                        fontFamily: 'System',
                    }}
                    onHTMLLoaded={() => checkContentHeight()}
                    onContentSizeChange={() => checkContentHeight()}
                    enableExperimentalBRCollapsing
                />
            </View>

            {showSeeMore && (
                <TouchableOpacity 
                    onPress={() => setExpanded(!expanded)}
                    style={{paddingHorizontal: 10, marginTop: 8}}
                >
                    <Text style={{
                        color: theme.colors.primary,
                        fontWeight: '500',
                        fontSize: 14
                    }}>
                        {expanded ? '▲ See Less' : '▼ See More'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default HtmlRendererWithSeeMore;
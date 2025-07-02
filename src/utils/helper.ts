//@ts-nocheck
import dayjs from "dayjs";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const delay = (ms = 0) =>
    new Promise(resolve => setTimeout(resolve, ms));

export const getFontConfig = () => ({
    // Display
    displayLarge: {
        fontFamily: 'Lato-Bold',
        fontSize: 57,
        lineHeight: 64,
        fontWeight: '700', // Explicit weight for better compatibility
    },
    displayMedium: {
        fontFamily: 'Lato-Bold',
        fontSize: 45,
        lineHeight: 52,
        fontWeight: '700',
    },
    displaySmall: {
        fontFamily: 'Lato-Bold',
        fontSize: 36,
        lineHeight: 44,
        fontWeight: '700',
    },

    // Headline
    headlineLarge: {
        fontFamily: 'Lato-Bold',
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
    },
    headlineMedium: {
        fontFamily: 'Lato-Bold',
        fontSize: 28,
        lineHeight: 36,
        fontWeight: '700',
    },
    headlineSmall: {
        fontFamily: 'Lato-Semibold',
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '600',
    },

    // Title
    titleLarge: {
        fontFamily: 'Lato-Semibold',
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '600',
    },
    titleMedium: {
        fontFamily: 'Lato-Semibold',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.15,
        fontWeight: '600',
    },
    titleSmall: {
        fontFamily: 'Lato-Regular',
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: '400',
    },

    // Body
    bodyLarge: {
        fontFamily: 'Lato-Regular',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.5,
        fontWeight: '400',
    },
    bodyMedium: {
        fontFamily: 'Lato-Regular',
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.25,
        fontWeight: '400',
    },
    bodySmall: {
        fontFamily: 'Lato-Regular',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.4,
        fontWeight: '400',
    },

    // Label
    labelLarge: {
        fontFamily: 'Lato-Semibold',
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.1,
        fontWeight: '600',
    },
    labelMedium: {
        fontFamily: 'Lato-Semibold',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    labelSmall: {
        fontFamily: 'Lato-Semibold',
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0.5,
        fontWeight: '600',
    },
});


export const formatDate = (date, time = false) => {
    const parsedDate = dayjs(date);
    if (!parsedDate.isValid()) {
        return 'Invalid Date'; // or return "";
    }

    const formatString = time ? 'MMMM DD, YYYY h:mm A' : 'MMMM DD, YYYY';
    return parsedDate.format(formatString);
};

export const formatDueDate = date => {
    const d = dayjs(date).startOf('day');
    const now = dayjs().startOf('day');
    const diff = d.diff(now, 'day');

    if (diff === 0) {
        return 'Due today';
    } else if (diff === 1) {
        return 'Due tomorrow';
    } else if (diff > 1 && diff <= 7) {
        return `Due in ${diff} days`;
    } else if (diff > 7) {
        return `Due ${d.format('MMM D')}`;
    } else if (diff === -1) {
        return 'Overdue by 1 day';
    } else if (diff < -1) {
        return `Overdue by ${Math.abs(diff)} days`;
    } else {
        return `Due ${d.format('MMM D')}`;
    }
};

const formatFacebookDate = date => {
    const d = dayjs(date);
    const now = dayjs();
    const diffInSeconds = now.diff(d, 'second');
    const diffInMinutes = now.diff(d, 'minute');
    const diffInHours = now.diff(d, 'hour');

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (d.isToday()) {
        return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
    } else if (d.isYesterday()) {
        return `Yesterday at ${d.format('h:mm A')}`;
    } else if (d.isSame(now, 'year')) {
        return d.format('MMM D [at] h:mm A');
    } else {
        return d.format('MMM D, YYYY [at] h:mm A');
    }
};

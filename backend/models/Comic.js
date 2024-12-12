const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true, // Thêm chỉ mục để tìm kiếm nhanh hơn
    },
    author: {
        type: String,
        required: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
    },
    chapters: {
        type: Number,
        default: 0,
        required: true,
    },
    status: {
        type: String,
        enum: ['Đang tiến hành', 'Hoàn thành', 'Tạm dừng', 'Hủy bỏ'],
        default: 'Đang tiến hành',
    },
    coverImage: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    ratings: [{
        username: { type: String, required: true },
        rating: { 
            type: Number, 
            required: true, 
            min: 1, // Giá trị tối thiểu cho rating
            max: 5  // Giá trị tối đa cho rating
        },
    }],
    averageRating: {
        type: Number,
        default: 0,
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    addedByAdmin: {
        type: Boolean,
        default: false, // Đánh dấu truyện được admin thêm
    },
    isNew: {
        type: Boolean,
        default: false, // Đánh dấu truyện mới
    },
    tags: [{
        type: String,
    }],
});

// Các phương thức cập nhật điểm đánh giá và lượt xem
comicSchema.methods.calculateAverageRating = function () {
    if (this.ratings.length > 0) {
        const total = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
        this.averageRating = total / this.ratings.length;
        this.totalRatings = this.ratings.length;
    } else {
        this.averageRating = 0;
        this.totalRatings = 0;
    }
};

// Tự động cập nhật `updatedAt` mỗi khi tài liệu được cập nhật
comicSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Cập nhật trường `updatedAt` khi cập nhật tài liệu
comicSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Comic = mongoose.model('Comic', comicSchema);

module.exports = Comic;

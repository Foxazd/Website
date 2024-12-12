// utils/slugify.js
const convertToSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/ /g, '-')         // Thay thế khoảng trắng bằng dấu gạch ngang
        .replace(/[^\w-]+/g, '')    // Loại bỏ các ký tự không phải chữ cái, số hoặc gạch ngang
        .replace(/--+/g, '-')       // Thay thế nhiều gạch ngang liên tiếp bằng một gạch ngang
        .trim();                    // Xóa khoảng trắng ở đầu và cuối chuỗi
};

export default convertToSlug;

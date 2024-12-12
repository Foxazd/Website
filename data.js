const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://pops.vn/comics/ac-nu-khi-yeu-60effff37d1f09005a6dc218/chuong-001-60f0049d7d1f09005a6dc228';

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    // Lấy nội dung truyện từ thẻ div với class đúng
    const content = $('.comics-chapter_imgWrap__l_eYq').text(); // Thay đổi selector

    console.log(content);
  })
  .catch(error => {
    console.error('Error fetching the page:', error);
  });

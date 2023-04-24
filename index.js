const puppeteer = require('puppeteer');
const fs = require('fs')
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({height:1080,width:1920})
  
  await page.goto('https://www.fahasa.com/sach-trong-nuoc/van-hoc-trong-nuoc.html');

  
  await page.waitForSelector('.item-inner');

  
  const productDetailUrls = await page.evaluate(() => {
    const bookElements = document.querySelectorAll('.item-inner');

    const urls = [];

    for (let element of bookElements) {
      const url = element.querySelector('.product > a').href;
      urls.push(url);
    }

    return urls;
  });

  console.log(productDetailUrls)

  const books = [];

  for (let url of productDetailUrls) {
    await page.goto(url);
    await page.waitForSelector('h1');

    const book = await page.evaluate(() => {
      const title = document.querySelector('h1').textContent.trim();
      const author = document.querySelector('.product-view-sa-author span:last-child').textContent.trim();
      const price = document.querySelector('.price').textContent.trim();
      const imgSrc = document.querySelector('#image').src;
      const description = document.querySelector('#desc_content').innerHTML;
      const language = document.querySelector('.data_languages').textContent.trim();
      const age = document.querySelector('.data_age > a').textContent.trim();
      const publisher = document.querySelector('.data_publisher').textContent.trim();

      // console.log(description)
      // const details = {};

      // const detailRows = document.querySelectorAll('.book-attribute tr');

      // for (let row of detailRows) {
      //   const label = row.querySelector('td:first-child').textContent.trim();
      //   const value = row.querySelector('td:last-child').textContent.trim();
      //   details[label] = value;
      // }

      return {
        title,
        author,
        price,
        imgSrc,
        description,
        language,
        age,
        publisher
        
      };
    });

    books.push(book);
  }

  console.log(books[0].title);
  fs.appendFileSync('data.txt', "INSERT INTO dbo.Book(Name, Description, Image, Author, Price, Age, Language, Pages, PublishingCompany, IsHidden, CreatedDate ) VALUES (   N'',     -- Name - nvarchar(250) NULL,    -- Description - nvarchar(max) NULL,    -- Image - nvarchar(max) N'',     -- Author - nvarchar(250) '',      -- Price - varchar(25) NULL,    -- Age - int NULL,    -- Language - nvarchar(250) NULL,    -- Pages - int NULL,    -- PublishingCompany - nvarchar(250) DEFAULT, -- IsHidden - bit DEFAULT  -- CreatedDate - date )")

  await browser.close();
})();

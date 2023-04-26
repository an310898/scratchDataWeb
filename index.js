const puppeteer = require("puppeteer");
const fs = require("fs");


(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ height: 1080, width: 1920 });

  // const UrlCate = [
  //   'https://www.fahasa.com/sach-trong-nuoc/van-hoc-trong-nuoc.html?order=num_orders&limit=48&p=1',
  //   'https://www.fahasa.com/sach-trong-nuoc/nuoi-day-con.html?order=num_orders&limit=48&p=1',
  //   'https://www.fahasa.com/sach-trong-nuoc/thieu-nhi.html?order=num_orders&limit=48&p=1',
  //   'https://www.fahasa.com/sach-trong-nuoc/tam-ly-ky-nang-song.html?order=num_orders&limit=48&p=1',
  //    'https://www.fahasa.com/sach-trong-nuoc/tieu-su-hoi-ky.html?order=num_orders&limit=48&p=1'
  // ]
  
  await page.goto(
    "https://www.fahasa.com/sach-trong-nuoc/tieu-su-hoi-ky.html?order=num_orders&limit=48&p=1"
  );

  await page.waitForSelector(".item-inner");

  const productDetailUrls = await page.evaluate(() => {
    const bookElements = document.querySelectorAll(".item-inner");

    const urls = [];

    for (let element of bookElements) {
      const url = element.querySelector(".product > a").href;
      urls.push(url);
    }

    return urls;
  });

  console.log(productDetailUrls);

  const books = [];

  for (let url of productDetailUrls) {
    
    await page.goto(url);
    await page.waitForSelector("h1");
    await page.waitForSelector("#desc_content");

    const book = await page.evaluate(() => {
      const Name = document.querySelector("h1").textContent.trim();
      const author = document .querySelector(".product-view-sa-author span:last-child")?.textContent.trim() || '';
      const price = document.querySelector(".price").textContent.trim();
      const image = document.querySelector("#image")?.src;
      const description = document.querySelector("#desc_content")?.innerHTML || 'Chưa có mô tả';
      const language = document .querySelector(".data_languages")?.textContent.trim() || '';
      const age = document.querySelector(".data_age > a")?.textContent.trim() || 0;
      const publisher = document .querySelector(".data_publisher")?.textContent.trim() || '';
      const pages = document .querySelector(".data_qty_of_page")?.textContent.trim() || 0;
      const cover = document .querySelector(".data_book_layout")?.textContent.trim() || '';
      const weight = document .querySelector(".data_weight")?.textContent.trim() || '';
      const size = document.querySelector(".data_size")?.textContent.trim() || '';
      
      return {
        Name,
        author,
        price,
        image,
        description,
        language,
        age,
        publisher,
        pages,
        cover,
        weight,
        size,
      };
    });
    console.log(book)
    books.push(book);
  }

  for (let book of books) {
    console.log(book);
    fs.appendFileSync('tieu-su-hoi-ky.txt', 
    `EXEC dbo.AddNewBook @Name = N'${book.Name}',              -- nvarchar(250)
    @Description = N'${book.description}',       -- nvarchar(max)
    @Image = N'${book.image}',             -- nvarchar(max)
    @Author = N'${book.author}',            -- nvarchar(250)
    @Price = '${book.price.replace('đ','').trim()}',              -- varchar(25)
    @Age = '${book.age}',                 -- int
    @Language = N'${book.language}',          -- nvarchar(250)
    @Pages = '${book.pages}',               -- int
    @PublishingCompany = N'${book.publisher}', -- nvarchar(250)
    @CoverType = N'${book.cover}',         -- nvarchar(250)
    @BookWeight = N'${book.weight}',        -- nvarchar(25)
    @BookSize = N'${book.size}',          -- nvarchar(50)
    @CategoryIdArrays = '5'    -- varchar(max)
`)
  }

  await browser.close();
})();

// This uses headless chrome to imitate a browser in an attempt to bypass "invisible" funcaptcha
// Note that Roblox is aggressively blocking IPs from cloud services like GCP and even VPS providers
// If your server uses a service like that it might be blocked and will be given captcha no matter what
// If you are given captcha this will fail by timeout
const puppeteer = require('puppeteer');
const rbx = require('roblox-js');

// We have to pretend to type our username and password
// If we put it in directly we will be detected as a bot and given captcha
const fakeType = (page, input, value) => {
  return new Promise((resolve, reject) => {
    const baseTime = 5;
    // const jitter = 50;
    const type = page.type.bind(page);
    let current = 0;
    for (let i = 0; i < value.length; i++) {
      current += baseTime;
      // current += Math.floor(Math.random() * jitter);
      setTimeout(type, current, input, value.charAt(i));
    }
    setTimeout(resolve, current);
  });
};

async function login(username, password)
{
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');
  await page.goto('https://www.roblox.com');
  await page.waitForSelector('#horizontal-login-username');
  await page.click('#horizontal-login-username');
  await fakeType(page, '#horizontal-login-username', username);
  await page.click('#horizontal-login-password');
  await fakeType(page, '#horizontal-login-password', password);
  await page.click('#horizontal-login-button');
  await page.screenshot({path: 'example.png'});
  try {
    await page.waitForNavigation({ timeout: 10000 });
  } catch (e) {
    console.log("Navigation failed or never triggered");
  }
  const cookies = await page.cookies();
  let sessionCookie
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].name === '.ROBLOSECURITY') {
      sessionCookie = cookies[i].value.substring(116);
      break;
    }
  }
  await browser.close();
  return {
    result : true,
    session : sessionCookie
  }
}

module.exports = login;
fetch('https://portfolio.aihoc.ai.vn/contact')
  .then((r) => r.text())
  .then((html) => {
    const mailMatch = html.match(/mailto:([a-zA-Z0-9@._-]+)/);
    const zaloMatch = html.match(/href="([^"]*zalo[^"]*)"/);
    console.log('mailto:', mailMatch ? mailMatch[1] : 'not found');
    console.log('zalo:', zaloMatch ? zaloMatch[1] : 'not found');
  });

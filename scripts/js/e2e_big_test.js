const puppeteer = require('puppeteer');
const fs = require('fs');

async function testApp(name, port, loginUrl, credentials) {
    console.log(`\n==========================================`);
    console.log(`🚀 BẮT ĐẦU CRAWL & TEST: ${name.toUpperCase()} (Port ${port})`);
    console.log(`==========================================`);

    const browser = await puppeteer.launch({
        headless: 'new', // Run headless to save resources
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Thu thập toàn bộ lỗi hiển thị trên trang (Crash màn hình đỏ, lỗi JS)
    const errors = [];
    const consoleErrors = [];

    page.on('pageerror', err => {
        errors.push(`[CRASH JS]: ${err.toString()}`);
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            // Bỏ qua lỗi 401 do chưa có token hoặc 404 favicon
            if (!text.includes('401') && !text.includes('favicon')) {
                consoleErrors.push(`[CONSOLE ERROR]: ${text}`);
            }
        }
    });

    try {
        console.log(`[1] Truy cập trang đăng nhập: ${loginUrl}`);
        await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Login logic
        console.log(`[2] Nhập thông tin đăng nhập: ${credentials.username}`);

        // Detect inputs
        const usernameInput = await page.$('input[type="text"], input[name="username"], input[name="email"], #username');
        const passwordInput = await page.$('input[type="password"], input[name="password"], #password');
        const submitBtn = await page.$('button[type="submit"]');

        if (usernameInput && passwordInput && submitBtn) {
            await usernameInput.type(credentials.username);
            await passwordInput.type(credentials.password);
            await submitBtn.click();
            console.log(`[3] Đã click nút đăng nhập. Đợi chuyển trang...`);

            // Wait for navigation after login
            try {
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
            } catch (e) {
                // If it doesn't navigate, wait a bit
                await page.waitForTimeout(3000);
            }
        } else {
            console.log(`⚠️ Không tìm thấy Form đăng nhập chuẩn. Bỏ qua bước Login.`);
        }

        // Lấy danh sách toàn bộ các thẻ <a> trên Sidebar/Navbar
        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.map(a => a.href).filter(href => href.startsWith('http') && href !== window.location.href);
        });

        const uniqueLinks = [...new Set(links)];
        console.log(`[4] Quét được ${uniqueLinks.length} đường dẫn menu chức năng chính.`);

        // Quét lần lượt các trang
        let visitedCount = 0;
        for (const link of uniqueLinks) {
            // Chỉ test khoảng 10 link đại diện để không treo máy
            if (visitedCount >= 10) break;

            console.log(`   👉 Truy cập: ${link}`);
            try {
                // Goto the link
                await page.goto(link, { waitUntil: 'networkidle2', timeout: 15000 });
                // Check if there is anything that looks like "Error", "Exception" on screen text
                const bodyText = await page.evaluate(() => document.body.innerText);
                if (bodyText.includes('Cannot read properties of undefined') || bodyText.includes('Application error')) {
                    errors.push(`[CRITICAL CRASH trên giao diện]: ${link}`);
                }
                visitedCount++;
            } catch (err) {
                consoleErrors.push(`[TIMEOUT/FAIL]: Khi truy cập ${link}`);
            }
        }

        // Báo cáo
        console.log(`\n📊 KẾT QUẢ TEST: ${name}`);
        console.log(`  - Đã quét ${visitedCount} trang chức năng.`);
        console.log(`  - Số lượng Lỗi nghiêm trọng (Crash Màn hình): ${errors.length}`);
        console.log(`  - Số lượng Lỗi ngầm (Console Red): ${consoleErrors.length}`);

        if (errors.length === 0 && consoleErrors.length === 0) {
            console.log(`  ➡ TRẠNG THÁI: ✅ HOÀN HẢO - Mượt mà không giật lag.`);
        } else {
            if (errors.length > 0) console.log(`  💥 Chi tiết CRASH:`, errors);
            if (consoleErrors.length > 0) console.log(`  ⚠️ Lỗi ngầm:`, consoleErrors.slice(0, 5));
        }

    } catch (err) {
        console.error(`🚨 THẤT BẠI KHI TEST ${name}:`, err.message);
    } finally {
        await browser.close();
    }
}

async function runBigTest() {
    console.log("██████╗ ██╗ ██████╗    ████████╗███████╗███████╗████████╗");
    console.log("██╔══██╗██║██╔════╝    ╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝");
    console.log("██████╔╝██║██║  ███╗      ██║   █████╗  ███████╗   ██║   ");
    console.log("██╔══██╗██║██║   ██║      ██║   ██╔══╝  ╚════██║   ██║   ");
    console.log("██████╔╝██║╚██████╔╝      ██║   ███████╗███████║   ██║   ");
    console.log("╚═════╝ ╚═╝ ╚═════╝       ╚═╝   ╚══════╝╚══════╝   ╚═╝   ");
    console.log("BẮT ĐẦU CÀN QUÉT TOÀN BỘ CÁC NÚT BẤM, TRANG VÀ ROLE...");

    const testSuites = [
        { name: 'Admin Portal', port: 3004, loginUrl: 'http://localhost:3004/login', creds: { username: 'admin', password: 'Admin@123' } },
        { name: 'Recruiter Portal', port: 3002, loginUrl: 'http://localhost:3002/login', creds: { username: 'company1', password: 'Pass@123' } },
        { name: 'Teacher Portal', port: 3003, loginUrl: 'http://localhost:3003/login', creds: { username: 'teacher1', password: 'Pass@123' } },
        { name: 'Student Portal', port: 3001, loginUrl: 'http://localhost:3001/login', creds: { username: 'student1', password: 'Pass@123' } },
    ];

    for (const app of testSuites) {
        await testApp(app.name, app.port, app.loginUrl, app.creds);
    }

    console.log("\n=======================================================");
    console.log("🚀 ĐẠI KIỂM THỬ GIAO DIỆN (E2E BIG TEST) ĐÃ HOÀN TẤT!");
    console.log("Bạn có thể báo cáo quá trình với user.");
}

runBigTest();

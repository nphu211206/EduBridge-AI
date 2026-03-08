async function testLogins() {
    try {
        console.log("Testing Teacher Login (teacher@edubridge.edu.vn / 123456)...");
        const teacherRes = await fetch('http://localhost:5003/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher@edubridge.edu.vn', password: '123456' })
        });
        const teacherData = await teacherRes.json();
        console.log("Teacher Response:", teacherRes.status, teacherData.message || "Success");

        console.log("\nTesting Admin Login (admin@edubridge.edu.vn / 123456)...");
        const adminRes = await fetch('http://localhost:5002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@edubridge.edu.vn', password: '123456' })
        });
        const adminData = await adminRes.json();
        console.log("Admin Response:", adminRes.status, adminData.message || "Success");

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}
testLogins();

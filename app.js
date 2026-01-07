function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// Dummy totals for Director View
let totalProcurement = 0;
let totalSales = 0;
let totalCredit = 0;

document.getElementById("procurementForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Produce procurement recorded successfully!");
    totalProcurement += 100000;
    document.getElementById("totalProcurement").innerText = totalProcurement;
    this.reset();
});

document.getElementById("salesForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Sale recorded successfully!");
    totalSales += 50000;
    document.getElementById("totalSales").innerText = totalSales;
    this.reset();
});

document.getElementById("creditForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Credit sale recorded successfully!");
    totalCredit += 70000;
    document.getElementById("totalCredit").innerText = totalCredit;
    this.reset();
});

const bcrypt = require('bcrypt');

async function generateHash() {
    const password = "123456";
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log(`Hash para senha '${password}':`);
        console.log(hash);
        console.log(`Tamanho do hash: ${hash.length} caracteres`);
    } catch (error) {
        console.error("Erro ao gerar hash:", error);
    }
}

generateHash();
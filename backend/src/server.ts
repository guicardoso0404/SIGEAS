import { Response } from "express"

const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
const port = 3001

app.use(cors())
app.use(express.json()) // agora deve funcionar corretamente
dotenv.config()
app.use(express.urlencoded({extended: true}))

app.get("/", (req: Request, res: Response) => {
    res.send("API com TypeScript funcionando!");
})

app.listen(port, () => {console.log(`Servidor rodando em https://localhsot:${port}`)})
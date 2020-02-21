const express = require('express')
const app = express()
const http = require('http')
const cryptoRandomString = require('crypto-random-string');
const uploadFile=require('express-fileupload')
let users = []
let id = 1
const cors=require('cors')
function App() {
    const server = http.createServer(app)
    const bodyParser = require('body-parser')
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(uploadFile({
        createParentPath:true
    }))
    app.get('/', (req, res) => {
        res.json({ users: users })
    })
    app.use('cors')
    app.post('/signup', (req, res) => {
        console.log("log");
        
        try {
            let errors = []
            var pattern = /^[a-z0-9]{1,}@[a-z0-9]{1,}\.[a-z]{1,}$/i
            if (!pattern.test(req.body.email) || req.body.password.length < 6) {
                if (!pattern.test(req.body.email)) {
                    errors.push({ key: 'email', errorText: "فرمت ایمیل وارد شده درست نیست" })
                }
                if (req.body.password.length < 6) {
                    errors.push({ key: "password", errorText: "رمز عبور باید حداتقل 6 کاراکتر باشد" })
                }
                res.status(400).json({ errors: errors })
                return
            }
            users.push({ id: id, email: req.body.email, password: req.body.password, token: "", token_type: "" })
            id = id + 1
            res.status(201).json([])
        } catch (e) {
            res.status(500).json([])
        }
    })
    app.post('/signin', (req, res) => {
        try {
            let errors = []
            var pattern = /^[a-z0-9]{1,}@[a-z0-9]{1,}\.[a-z]{1,}$/i
            if (!pattern.test(req.body.email) || req.body.password.length < 6) {
                if (!pattern.test(req.body.email)) {
                    errors.push({ key: 'email', errorText: "فرمت ایمیل وارد شده درست نیست" })
                }
                if (req.body.password.length < 6) {
                    errors.push({ key: "password", errorText: "رمز عبور باید حداتقل 6 کاراکتر باشد" })
                }
                res.status(400).json({ errors: errors })
                return
            }
            users.forEach(user => {
                if (user.email == req.body.email && user.password == req.body.password) {
                    let token = cryptoRandomString({ length: 32, type: 'base64' })
                    let token_type = 'Bearer'
                    user.token = token
                    user.token_type = token_type
                    res.status(200).json({ token: token, token_type: token_type })
                    return
                }
            });
            res.status(403).json({ errorText: "کاربری با این مشخصات یافت نشد" })
        } catch (e) {
            res.status(500).json([])
        }
    })

    app.get('/profile', (req, res) => {
        const [token_type, token] = req.header('Authorization').split(' ')
        users.forEach(user => {
            if (user.token == token && user.token_type == token_type) {
                res.status(200).json({ user: user })
                return
            }
        });
        res.status(401).json({ errorText: "Unauthorized " })
    })

    app.delete('/delete', (req, res) => {
        try {
            let user_id = req.query.id
            let users2 = users
            users = users2.filter((user) => {
                return user.id != user_id
            })
            res.status(200).json({ users: users })
        } catch (e) {
            res.status(500).json([])
        }
    })

    app.patch('/update', (req, res) => {
        try {
            let user_id = req.query.id
            users.forEach(user => {
                if (user.id == user_id) {
                    user.email = req.body.email
                    res.status(200).json({ user: user })
                    return
                }
            });
            res.status(403).json([])
        } catch (e) {
            res.status(500).json([])
        }
    })

    app.get('/paginate',(req,res)=>{
        let page=req.query.page && req.query.page!="" ? req.query.page:1
        if(page==1){
            res.status(200).json({
                current_page:page,
                last_page:2,
                count:6,
                data:[
                    {id:1,title:"محصول یک",image:"https://dkstatics-public.digikala.com/digikala-products/113562469.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60"},
                    {id:1,title:"محصول دوم",image:"https://dkstatics-public.digikala.com/digikala-products/114612944.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60"},
                    {id:1,title:"محصول سوم",image:"https://dkstatics-public.digikala.com/digikala-products/114612944.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60"},
                ]
            })
            return
        }else if(page==2){
            res.status(200).json({
                current_page:page,
                last_page:2,
                count:6,
                data:[
                    {id:1,title:"محصول چهارم",image:"https://dkstatics-public.digikala.com/digikala-products/113846203.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60"},
                    {id:1,title:"محصول پنجم",image:"https://dkstatics-public.digikala.com/digikala-products/113846203.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60"},
                    {id:1,title:"محصول ششم",image:"https://dkstatics-public.digikala.com/digikala-products/113846203.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60"},
                ]
            })

        }else{
            res.status(200).json({
                current_page:page,
                last_page:2,
                count:6,
                data:[]
            }
            )

        }
    })


    app.post('/upload',(req,res)=>{
        try{
            if(req.files.image.mimetype=="image/jpeg" || req.files.image.mimetype=="image/jpg" || req.files.image.mimetype=="image/png"){
                req.files.image.mv('./upload/'+Date.now()+ req.files.image.name)
                res.status(200).json(req.files.image.mimetype)
            }
            res.status(400).json({errorText:"فرمت فایل وارد شده درست نیست"})
        }catch(e){
            res.status(500).json([])
        }
        
    })

    server.listen(3001, () => {
        console.log('server running on port 3001');

    })
}

module.exports = App



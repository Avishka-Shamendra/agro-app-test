const AdminController = require('../../../controllers/adminController');
const sql = require('../../../config/db');
let server;
describe('Admin', () => {
    const res={
        render:null,
        redirect:null,
    };
    beforeEach(async () => {
        server = require('../../../index').server; 
        res.render= jest.fn();
        res.redirect= jest.fn();  
    });
    afterEach(async () => {
        res.render= null;
        res.redirect= null;
        await server.close();
    });
    afterAll(async()=>{
        await sql.end();
    })
    describe('homePage', () => {
        
        it('should render home page with error and user params',()=>{
            const req={
                query:{error:'test error'},
                session:{user:{uid:1}},
            }
            AdminController.homePage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminHome',{
                error:'test error',
                user:{uid:1}
            });
        })
    });
    describe('signup', () => {
        
        it("should redirect to '/login' with success if no error", async () => {
            const req = {
                body:{
                    email: 'test@gmail.com',
                    password: 'test123',
                    confirmPassword: 'test123',
                    firstName:'Avishka',
                    lastName:'Shamendra',
                    gender:'Male',
                    securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCAxu'
                }
            }
            await AdminController.signup(req,res);

            // Delete new rows added in test
            await sql`DELETE FROM userinfo WHERE email=${req.body.email}`;

            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/login[?]adminRegSuccess/));
            
            
        });
        it("should redirect to '/signup' if email already exist", async () => {
            
            await sql`INSERT INTO UserInfo (email, type, password, first_name,last_name,gender) 
                    VALUES ('test@gmail.com', 'admin', '#$#t6e4gryg','firstName','lastName','Male')`;

            const req = {
                body:{
                    email: 'test@gmail.com',
                    password: 'test123',
                    confirmPassword: 'test123',
                    firstName:'Avishka',
                    lastName:'Shamendra',
                    gender:'Male',
                    securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCAxu'
                }
            }
            
            const result = await AdminController.signup(req,res);

            // Delete new rows added in test
            await sql`DELETE FROM userinfo WHERE email=${req.body.email}`;

            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/signup[?]error/));
               
        });
        it("should redirect to '/signup' if security key invalid", async () => {
            
            await sql`INSERT INTO UserInfo (email, type, password, first_name,last_name,gender) 
                    VALUES ('test@gmail.com', 'admin', '#$#t6e4gryg','firstName','lastName','Male')`;

            const req = {
                body:{
                    email: 'test@gmail.com',
                    password: 'test123',
                    confirmPassword: 'test123',
                    firstName:'Avishka',
                    lastName:'Shamendra',
                    gender:'Male',
                    securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCA'
                }
            }
            
            await AdminController.signup(req,res);

            // Delete new rows added in test
            await sql`DELETE FROM userinfo WHERE email=${req.body.email}`;

            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/signup[?]error/));
               
        });
        
    });
    describe('signUpPage', () => {
        
        it('should render signup page with necessary data',()=>{
            const req={
                query:{
                    error:'test error',
                    email:'test@gmail.com',
                    firstName:'firstName',
                    lastName:'lastName',
                    gender:'Male',
                    securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCAxu'
                },
                session:{user:{uid:1}},
            }
            const expected={
                error:'test error',
                email:'test@gmail.com',
                user:{uid:1},
                firstName:'firstName',
                lastName:'lastName',
                gender:'Male',
                securityKey:'qmYwp6J3yJO3TQKPaVTuUQnFGU6gCAxu'
            }
            AdminController.signupPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminSignUp',expected);
        })
    });
    describe('editProfile', () => {
        const req={
            body:{
                firstName:'First Name',
                lastName:'Last Name',
                gender:'Male',
                email:'test@gmail.com',
            },
            params:{uid:'123e4567-e89b-12d3-a456-426614174000'},
            session:{user:{type:'admin'}},
        }
        it("should redirect to '/editProfile' with error message if given id is not valid", async()=>{
            await AdminController.editProfile(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]error=BadRequest: No Such User Exist/));

        })
    });
});
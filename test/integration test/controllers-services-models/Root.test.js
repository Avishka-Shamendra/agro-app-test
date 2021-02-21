const rootController = require('../../../controllers/rootController');
const sql = require('../../../config/db');
let server;
describe('root Controller', () => {
    const res={
        render:null,
        redirect:null,
        json:null,
    };
    beforeEach(async () => {
        server = require('../../../index').server; 
        res.render= jest.fn();
        res.redirect= jest.fn();  
        res.json= jest.fn();
    });
    afterEach(async () => {
        res.render= null;
        res.redirect= null;
        res.json=null;
        await server.close();
    });
    afterAll(async()=>{
        await sql.end();
    })

    describe('index page method', ()=>{
        let req;
        beforeEach(() => {
            
            req={
                query:{},
                session:{user:{}}
            } 
        });
        it('should render index page if no error', async ()=>{
            await rootController.indexPage(req,res)
            expect(res.render).toHaveBeenCalledWith('index',expect.objectContaining({
                posts:expect.any(Array)
            }));
        });
        it('should render index if any error', async()=>{
            req.query=null
            await rootController.indexPage(req,res)
            expect(res.render).toHaveBeenCalledWith('index', expect.objectContaining({
                error: expect.any(String),                
            }));
        });

    });


    describe('login page method', ()=>{
        it('should render login page with error,and email if any error ',()=>{
            const req={
                query:{error:'test error',
                       email:'test@gmail.com',
                       adminRegSuccess:"admin register successful",
                       farmerRegSuccess:"farmer register successful",
                       buyerRegSuccess:"buyer register successful",
                       del_acc_success:"delete account successful"},
                session:{user:{uid:1}}
            }
            rootController.loginPage(req,res);
            expect(res.render).toHaveBeenCalledWith('login',{
                error:'test error',
                email:'test@gmail.com',
                user:{uid:1},
                adminRegSuccess:"admin register successful",
                farmerRegSuccess:"farmer register successful",
                buyerRegSuccess:"buyer register successful",
                del_acc_success:"delete account successful"
            })
        })
    });
    describe('editprofilepage method', ()=>{
        it('should render userEditProfile if any error',()=>{
            const req={
                query:{error:'test error',
                       success:'success message',
                       pwd_success:"pwd success message",
                       pwd_error:"pwd error message",
                       del_acc_error:"delete account error message",},
                session:{user:{uid:1}}
            }
            rootController.editProfilePage(req,res)
            expect(res.render).toHaveBeenCalledWith('userEditProfile',{
                error:'test error',
                user:{uid:1},
                success:'success message',
                pwd_success:"pwd success message",
                pwd_error:"pwd error message",
                del_acc_error:"delete account error message",
            })
        })
    })

    describe('creditpage method', ()=>{
        it('should render _credits_aboutus if any error',()=>{
            const req={
                query:{error:'test error'},
                session:{user:{uid:1}}
            }
            rootController.creditPage(req,res)
            expect(res.render).toHaveBeenCalledWith('_credits_aboutus',{
                error:'test error',
                user:{uid:1},
            })
        })
    })

    describe('login method', ()=>{
        let req;
        beforeEach(()=>{
            req={
                body:{
                    password:'12345',
                    email:'test1@gmail.com'
                },
                session:{
                    user:{}
                }
            }
        });
        it('should redirect to loginPage if validation fails',async()=>{
                req.body.email=""
                await rootController.login(req,res)
                expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/login[?]error=ValidationError/))
        });
        it('should redirect to loginPage if email is not registered',async()=>{
            req.body.email="test"
            await rootController.login(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/login[?]error=BadRequest/))
        });
        it('should redirect to loginPage if password is not correct',async()=>{
            req.body.password="1234"
            await rootController.login(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/login[?]error=BadRequest: Invalid Email[/]password/))
        });
        it('should redirect to loginPage if account is banned',async()=>{
            req.body.email='test6@gmail.com'
            req.body.password="12345"
            await rootController.login(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/login[?]error=Unauthorized: This account is currently banned/))
        });
        it('should redirect to user home page if no error',async()=>{
            req.body.email='test2@gmail.com'
            req.body.password="12345"
            
            await rootController.login(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/farmer/))
        });


    })
    describe('logout method',()=>{
        let req;
        beforeEach(()=>{
            req={
                session:{
                    user:{}
                }
            }
        });
        it('should redirect to index page if no error',async()=>{
            await rootController.logout(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]/))
        })
        it('should redirect to index page if any error',async()=>{
            req.session=null
            await rootController.logout(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]/))
        })
        
    })

    describe('changePassword method', ()=>{
        let req;
        beforeEach(()=>{
            req={
                body:{
                    old_pwd:'123456',
                    new_pwd:'56789',
                    confirm_pwd:'56789'
                },
                user:{
                    uid:'00000000-0000-4000-8000-000000000007'
                },
                params:{
                    uid:'00000000-0000-4000-8000-000000000007'
                }
            }

        

        });
        it('should redirect to editProfile if validation fails',async()=>{
            await rootController.changePassword(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]pwd_error=ValidationError/))
        })
        it('should redirect to editProfile if current password is wrong',async()=>{
            req.body.old_pwd="1234567"
            req.body.new_pwd="567890"
            req.body.confirm_pwd="567890"
            await rootController.changePassword(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]pwd_error=BadRequest: Current Password is not correct/))
        })
        it('should redirect to editProfile if no error',async()=>{
            req.body.old_pwd="123456"
            req.body.new_pwd="567890"
            req.body.confirm_pwd="567890"
            await rootController.changePassword(req,res)
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]pwd_success=Password Changed Successfully.#changePassword/))

            req.body.old_pwd="567890"
            req.body.new_pwd="123456"
            req.body.confirm_pwd="123456"
            await rootController.changePassword(req,res)

        })

    })
    describe('deleteAccount method', ()=>{
        let req;
        beforeEach(()=>{
            req={
                body:{
                    del_password:'123456'
                },
                session:{user:{
                    uid:'00000000-0000-4000-8000-000000000007'
                }},
                params:{
                    uid:'00000000-0000-4000-8000-000000000007'
                }
            }
    })
    it('should redirect editProfile if user id is wrong',async()=>{
        req.params.uid='1'
        await rootController.deleteAccount(req,res)
        expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]del_acc_error=BadRequest: OOPS could not delete user#delAccount/))
    })
    it('should redirect editProfile if password id is wrong',async()=>{
        req.body.del_password='12345'
        await rootController.deleteAccount(req,res)
        expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/editProfile[?]del_acc_error=BadRequest: Password Entered Not Valid#delAccount/))
    })
    it('should redirect login if user is deleted',async()=>{
        req.body.del_password='123456'
        await rootController.deleteAccount(req,res)
        expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/login[?]del_acc_success=Account Deleted Successfully/))

        await sql`INSERT INTO UserInfo (uid,email, type, password, first_name,last_name,gender) VALUES ('00000000-0000-4000-8000-000000000007','test7@gmail.com','buyer','$2b$10$dJOQi73zTgi.tWOMK57yVeQOOtqCuLUcfREUKTiSMwwLUtGqK/A8K','testFirstName7','testlastName7','Male');
        `
    })
    })

});
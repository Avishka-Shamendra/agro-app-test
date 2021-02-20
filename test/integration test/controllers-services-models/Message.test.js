const MessageController = require('../../../controllers/messageController');
const sql = require('../../../config/db');
const session = require('express-session');
let server;

describe('Message Controller', () => {
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

    describe('buyerRequest method', () => {
        let req;
        beforeEach(async() => {
            await sql`INSERT INTO Post VALUES('50000000-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000002','Test Product 2','Test Post 2','Descriiption 2','vegetable',100,100,'Colombo','Address 2','0777200000','Active',NOW()::DATE,NOW()::DATE + INTERVAL '30 days',false);`;
            req = {
                body:{
                    title: 'fdsafdsafdsafdsaf',
                    description: 'This is the testing for buyer requests.Testing case',
                },
                session:{user:{uid:"00000000-0000-4000-8000-000000000004"}},
                params:{postid:"50000000-0000-4000-8000-000000000000"}
            }
        });
        afterEach(async() => {
            // Delete new rows added in test
             await sql`DELETE FROM Post WHERE post_id='50000000-0000-4000-8000-000000000000'`;
        });
        it('should redirect /buyer/viewpost page with success message if no error',async ()=>{
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/Your buyer request is sent to the farmer. Get in touch with the farmer using the contact number for/));
        })

        it('should redirect /buyer/viewpost with Validation Error if Title Joi Validation fails',async ()=>{
            req.body.title="ab"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/msg_error=ValidationError: "Title" length must be at least 5 characters long/));
        })

        it('should redirect /buyer/viewpost with Validation Error if Description Joi Validation fails',async ()=>{
            req.body.description="ab"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/ValidationError: "Message" length must be at least 20 characters/));
        })
        it('should redirect /buyer/viewpost with Error if already have sent a buyer request',async ()=>{
            req.session.user.uid="00000000-0000-4000-8000-000000000004"
            req.params.postid="10000000-0000-4000-8000-000000000000"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/Unauthorized: You have already sent a request to this post/));
        })
        it('should redirect /buyer/viewpost with Error if post is not in status Active',async ()=>{
            req.params.postid="30000000-0000-4000-8000-000000000000"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/msg_error=BadRequest: OOPS could not send message/));
        })
        it('should redirect /buyer/viewpost with Error if user is not a buyer',async ()=>{
            req.session.user.uid="00000000-0000-4000-8000-000000000002"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/msg_error=Unauthorized: You do not have permission to add new posts/));
        })
    });
})
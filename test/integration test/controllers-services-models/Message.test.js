const MessageController = require('../../../controllers/messageController');
const sql = require('../../../config/db');
const session = require('express-session');
const { any } = require('joi');
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

    describe('buyerRequest Method', () => {
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
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_success=Your buyer request is sent to the farmer./));
        })

        it('should redirect /buyer/viewpost with Validation Error if Title Joi Validation fails',async ()=>{
            req.body.title="ab"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_error=ValidationError: "Title" length must be at least 5 characters long/));
        })

        it('should redirect /buyer/viewpost with Validation Error if Description Joi Validation fails',async ()=>{
            req.body.description="ab"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_error=ValidationError: "Message" length must be at least 20 characters/));
        })
        it('should redirect /buyer/viewpost with Error if already have sent a buyer request',async ()=>{
            req.session.user.uid="00000000-0000-4000-8000-000000000004"
            req.params.postid="10000000-0000-4000-8000-000000000000"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]10000000-0000-4000-8000-000000000000[?]msg_error=Unauthorized: You have already sent a request to this post/));
        })
        it('should redirect /buyer/viewpost with Error if post is not in status Active',async ()=>{
            req.params.postid="30000000-0000-4000-8000-000000000000"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]30000000-0000-4000-8000-000000000000[?]msg_error=BadRequest: OOPS could not send message/));
        })
        it('should redirect /buyer/viewpost with Error if user is not a buyer',async ()=>{
            req.session.user.uid="00000000-0000-4000-8000-000000000002"
            await MessageController.buyerRequest(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]viewpost[/]50000000-0000-4000-8000-000000000000[?]msg_error=Unauthorized: You do not have permission to add new posts/));
        })
    });

    describe("deleteMsg Method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{msg_id:"11111111-0000-4000-8000-000000000000"}
            }
        });

        it('should redirect /buyer/sentRequests with success message if no error',async ()=>{
            req.params.postid="30000000-0000-4000-8000-000000000000"
            await MessageController.deleteMsg(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]sentRequests[?]del_suc=Message Deleted from the System Successfully/));
            await sql`INSERT INTO Buyer_Request VALUES('11111111-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000000','Test Req Title 1','Test Description 1','New',NOW()::DATE);`;
        })

        it('should redirect to /buyer/sentRequests with error message',async ()=>{
            const req={
                params:null,
            }
            await MessageController.deleteMsg(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[/]sentRequests[?]error=/));
        })
    })

    describe("deleteMsgViewPost Method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{msg_id:"11111111-0000-4000-8000-000000000000"}
            }
        });

        it('should redirect /buyer with success message if no error',async ()=>{
            req.params.postid="30000000-0000-4000-8000-000000000000"
            await MessageController.deleteMsgViewPost(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[?]success=Message Deleted from the System Successfully/));
            await sql`INSERT INTO Buyer_Request VALUES('11111111-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000000','Test Req Title 1','Test Description 1','New',NOW()::DATE);`;
        })
        it('should redirect to /buyer with error message',async ()=>{
            const req={
                params:null,
            }
            await MessageController.deleteMsgViewPost(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]buyer[?]error=/));
        })
    })

    describe("deleteMsgAdmin Method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{req_msg_id:"11111111-0000-4000-8000-000000000000"}
            }
        });

        it('should redirect /admin/buyerRequests with success message if no error',async ()=>{
            
            await MessageController.deleteMsgAdmin(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]buyerRequests[?]success=Message Deleted from the System Successfully/));
            await sql`INSERT INTO Buyer_Request VALUES('11111111-0000-4000-8000-000000000000','00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000000','Test Req Title 1','Test Description 1','New',NOW()::DATE);`;
        })
        it('should redirect to /admin/buyerRequests with error message',async ()=>{
            const req={
                params:null,
            }
            await MessageController.deleteMsgAdmin(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[/]buyerRequests[?]error=/));
        })
    })

    describe("adminMessagesPage Method",()=>{
        it('should render adminBuyerRequest Page with all requests',async ()=>{
            const req={
                query:{error:'test error', success:'test success'},
                session:{user:{uid:1}},
            }
            await MessageController.adminMessagesPage(req,res);
            expect(res.render).toHaveBeenCalledWith('adminBuyerRequestPage',{
                error:"test error",
                success:'test success',
                user:{uid:1},
                requests: expect.arrayContaining([expect.objectContaining({
                    req_msg_id:'11111111-0000-4000-8000-000000000000',
                }),expect.objectContaining({
                    req_msg_id:'22222222-0000-4000-8000-000000000000',
                })])
    
            });
        })

        it('should redirect to /admin with error message',async ()=>{
            const req={
                query:null,
            }
            await MessageController.adminMessagesPage(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]admin[?]error=/));
        })
    })

    describe("markAsInterested Method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{req_id:"11111111-0000-4000-8000-000000000000",
                        post_id:"10000000-0000-4000-8000-000000000000"}
            }
        });

        it('should redirect /farmer/post with success message if no error',async ()=>{
            await MessageController.markAsInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_success=Request Message Sucessfully Marked as Interested#requests/));
            await sql`
            UPDATE buyer_request 
            SET req_state='New'
            WHERE req_msg_id='11111111-0000-4000-8000-000000000000'
            RETURNING *
            `;
        })

        it('should redirect /farmer/post with error Message',async ()=>{
            req.params.req_id=null
            await MessageController.markAsInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_error=Could not change state to Interested.Please try again later#requests/));
        })

    })

    describe("markAsNotInterested Method",()=>{
        let req;
        beforeEach(async() => {
            req = {
                params:{req_id:"11111111-0000-4000-8000-000000000000",
                        post_id:"10000000-0000-4000-8000-000000000000"}
            }
        });

        it('should redirect /farmer/post with success message if no error',async ()=>{
            await MessageController.markAsNotInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_success=Request Message Sucessfully Marked as Not Interested#requests/));
            await sql`
            UPDATE buyer_request 
            SET req_state='New'
            WHERE req_msg_id='11111111-0000-4000-8000-000000000000'
            RETURNING *
            `;
        })

        it('should redirect /farmer/post with error Message',async ()=>{
            req.params.req_id=null
            await MessageController.markAsNotInterested(req,res);
            expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/[/]farmer[/]post[/]10000000-0000-4000-8000-000000000000[?]req_error=Could not change state to Not Interested.Please try again later#requests/));
        })

    })

})
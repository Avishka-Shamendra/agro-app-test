const ifNotLoggedIn = require('../../../middleware/ifNotLoggedIn');
let server;
    

describe('ifNotLoggedIn Middleware', () => {
    const res = {
        render: jest.fn(),
        redirect: jest.fn()
    };

    const next = jest.fn();

    beforeEach(() => {
        server = require('../../../index').server;

    });

    afterEach(() => {
        server.close();
    });

    it("should call if next no user exists in session", async () => {
        const agrs =[null,undefined,'',NaN,0,false]
        agrs.forEach((arg)=>{
            const req = {session:{ user: arg}};
        ifNotLoggedIn(req,res,next);
        expect(next).toHaveBeenCalled();
        })
        
    });

    it("should redirect to '/admin' if session has user of type admin", async () => {
        const req = {session:{ user: {type:'admin'}}};
        ifNotLoggedIn(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/admin');
    });

    it("should redirect to '/buyer' if session has user of type buyer", async () => {
        const req = {session:{ user: {type:'buyer'}}};
        ifNotLoggedIn(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/buyer');
    });
    it("should redirect to '/farmer' if session has user of type farmer", async () => {
        const req = {session:{ user: {type:'farmer'}}};
        ifNotLoggedIn(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/farmer');
    });
    
    it("should redirect to '/' and set user to null, if session has user with any other type", async () => {
        const req = {session:{user:{type:'type'}}};
        ifNotLoggedIn(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/');
        expect(req.session.user).toBeFalsy();
    });
});
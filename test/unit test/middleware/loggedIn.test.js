const ifLoggedIn = require('../../../middleware/ifLoggedIn');
let server;
    

describe('ifLoggedIn Middleware', () => {
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

    it("should call next, and clear user, if a banned user exists in session", async () => {
        const req = {session:{ user: {banned:true}}};
        ifLoggedIn(req,res,next);
        expect(next).toHaveBeenCalled();
        expect(req.session.user).toMatchObject({});
    });

    it("should call next if a user exists in session", async () => {
        const req = {session:{ user: {banned:false}}};
        ifLoggedIn(req,res,next);
        expect(next).toHaveBeenCalled();
    });
    
    it("should redirect to '/' if session has a no user", async () => {
        const req = {session:{}};
        ifLoggedIn(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});
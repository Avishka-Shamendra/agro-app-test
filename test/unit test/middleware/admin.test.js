const ifAdmin = require('../../../middleware/ifAdmin');
let server;    

describe('ifAdmin Middleware', () => {
    const res = {
        render: jest.fn(),
        redirect: jest.fn()
    };

    const next = jest.fn();

    beforeEach(() => {
       server = require('../../../index').server;;
    });

    afterEach(async () => {
        server.close();
    });

    it("should call next() if session has a user and type is admin", async () => {
        const req = {session:{ user: {type: 'admin'}}};
        ifAdmin(req,res,next);
        expect(next).toHaveBeenCalled();
    });
    it("should redirect to '/<type>' if session has a user and type is not admin", async () => {
        const req = {session:{ user: {type: 'type'}}};
        ifAdmin(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/type');
    });
    it("should redirect to '/' if session has a no user", async () => {
        const req = {session:{}};
        ifAdmin(req,res,next);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});
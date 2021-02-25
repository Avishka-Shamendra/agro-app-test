const { imageFilter, fileError } = require("../../../middleware/upload");

describe('upload middleware', () => {
    const res={
        render:null,
        redirect:null,
        json:null,
    };
    let cb;
    let next;
    beforeEach(async () => {
        res.render= jest.fn();
        res.redirect= jest.fn();  
        res.json= jest.fn();
        cb=jest.fn();
        next=jest.fn();
    });
    afterEach(async () => {
        res.render= null;
        res.redirect= null;
        res.json=null;
        cb=null;
        next=null;
    });
    describe('image filter function', () => {
        it('should call the cb function with null,true if mime type of file begin with "image"', () => {
            const req={}
            const file={mimetype:"imagexx"}
            imageFilter(req,file,cb)
            expect(cb).toHaveBeenCalledWith(null,true);
        });
        it('should call the cb function with filetypeError,false if mime type of file does not begin with "image"', () => {
            const req={}
            const file={mimetype:"xxx"}
            imageFilter(req,file,cb)
            expect(cb).toHaveBeenCalledWith("filetypeError", false);
        });
    });
    describe('fileError function', () => {
        it('should call next with error if error is passed', () => {
            fileError('test error',next)
            expect(next).toHaveBeenCalledWith('test error');
        });
    });
});
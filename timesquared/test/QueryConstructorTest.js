'use strict';

describe('QueryConstructor', function () {
    
    it('should create a time filter', function () {
        var queryObj = QueryConstructor.queryTime(4, 6),
            result;
        
        expect(queryObj).toEqual(
            {
                "startTime": {$and: [{$gte: 4}, {$lt: 6}]}
            }
        );
        
        result = sift(queryObj, [
            {"startTime": 1, "endTime": 2},
            {"startTime": 2, "endTime": 3},
            {"startTime": 3, "endTime": 4},
            {"startTime": 4, "endTime": 5},
            {"startTime": 5, "endTime": 6},
            {"startTime": 6, "endTime": 7},
            {"startTime": 7, "endTime": 8},
            {"startTime": 8, "endTime": 9}
        ]);
        
        expect(result).toEqual([
            {"startTime": 4, "endTime": 5},
            {"startTime": 5, "endTime": 6}
        ]);
    });
    
    it('should update a time filter', function () {
        var queryObj = QueryConstructor.queryTime(1, 10);
        
        queryObj = QueryConstructor.queryTime(2, 9, queryObj);
        
        expect(queryObj).toEqual(
            {
                "startTime": {$and: [{$gte: 2}, {$lt: 9}]}
            }
        );
    });
    
    it('should create a single thread filter', function () {
        var queryObj = QueryConstructor.queryThread(1),
            result;
        
        expect(queryObj).toEqual(
            {
                "threadName": 1
            }
        );
        
        result = sift(queryObj, [
            {"threadName": 1},
            {"threadName": 2},
            {"threadName": 3}
        ]);
        
        expect(result).toEqual([
            {"threadName": 1}
        ]);
    });
    
    it('should create a multi-thread filter', function () {
        var queryObj = QueryConstructor.queryThread([1,3]),
            result;
        
        expect(queryObj).toEqual(
            {
                "threadName": {$or: [1, 3]}
            }
        );
        
        result = sift(queryObj, [
            {"threadName": 1},
            {"threadName": 2},
            {"threadName": 3}
        ]);
        
        expect(result).toEqual([
            {"threadName": 1},
            {"threadName": 3}
        ]);
    });
    
    it ('should combine multiple filter types', function () {
        var queryObj,
            result;
        
        queryObj = QueryConstructor.queryThread([1, 3], queryObj);
        queryObj = QueryConstructor.queryTime(4, 6, queryObj);
        
        expect(queryObj).toEqual(
            {
                "threadName": {$or: [1, 3]},
                "startTime": {$and: [{$gte: 4}, {$lt: 6}]}
            }
        );
        
        result = sift(queryObj, [
            {"startTime": 3, "endTime": 4, "threadName": 1},
            {"startTime": 4, "endTime": 5, "threadName": 1},
            {"startTime": 5, "endTime": 6, "threadName": 1},
            {"startTime": 6, "endTime": 7, "threadName": 1},
            
            {"startTime": 3, "endTime": 4, "threadName": 2},
            {"startTime": 4, "endTime": 5, "threadName": 2},
            {"startTime": 5, "endTime": 6, "threadName": 2},
            {"startTime": 6, "endTime": 7, "threadName": 2},
            
            {"startTime": 3, "endTime": 4, "threadName": 3},
            {"startTime": 4, "endTime": 5, "threadName": 3},
            {"startTime": 5, "endTime": 6, "threadName": 3},
            {"startTime": 6, "endTime": 7, "threadName": 3},
        ]);
        
        expect(result).toEqual([
            {"startTime": 4, "endTime": 5, "threadName": 1},
            {"startTime": 5, "endTime": 6, "threadName": 1},
            {"startTime": 4, "endTime": 5, "threadName": 3},
            {"startTime": 5, "endTime": 6, "threadName": 3}
        ]);
    });
});
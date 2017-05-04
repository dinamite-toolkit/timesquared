'use strict';

describe('ThreadProcessor', function () {
    it('should convert a single event to transferrable array', function() {
        var transferrableArray;
        
        transferrableArray = TransferrableEventObj.toTransferrableArray([
            {
                threadName: 1,
                functionName: 2,
                lockName: 3,
                startTime: 4,
                endTime: 5,
                stackDepth: 6
            }
        ]);
        
        expect(transferrableArray[TransferrableEventObj.THREADNAME_INDEX]).toEqual(1);
        expect(transferrableArray[TransferrableEventObj.FUNCTIONNAME_INDEX]).toEqual(2);
        expect(transferrableArray[TransferrableEventObj.LOCKNAME_INDEX]).toEqual(3);
        expect(transferrableArray[TransferrableEventObj.STARTTIME_HIGH_INDEX]).toEqual(0);
        expect(transferrableArray[TransferrableEventObj.STARTTIME_LOW_INDEX]).toEqual(4);
        expect(transferrableArray[TransferrableEventObj.ENDTIME_HIGH_INDEX]).toEqual(0);
        expect(transferrableArray[TransferrableEventObj.ENDTIME_LOW_INDEX]).toEqual(5);
        expect(transferrableArray[TransferrableEventObj.STACKDEPTH_INDEX]).toEqual(6);
        expect(transferrableArray.length).toEqual(TransferrableEventObj.NUM_FIELDS);
    });
    
    it('should convert a transferrable array back to an event', function() {
        var eventObjArray;
        
        eventObjArray = TransferrableEventObj.fromTransferrableArray([
            1,
            2,
            3,
            0,4,
            0,5,
            6
        ]);
        
        expect(eventObjArray[0]).toEqual({
            threadName: 1,
            functionName: 2,
            lockName: 3,
            startTime: 4,
            endTime: 5,
            stackDepth: 6
        });
    });
    
    it('should work with large timestamps', function() {
        var transferrableArray;
        
        transferrableArray = TransferrableEventObj.toTransferrableArray([
            {
                threadName: 1,
                functionName: 2,
                lockName: 3,
                startTime: 0x0000beefcafebabe,
                endTime: 1456966516531728917, // 0x14382F53D3831215
                stackDepth: 6
            }
        ]);
        
        expect(transferrableArray.length).toEqual(TransferrableEventObj.NUM_FIELDS);
        expect(transferrableArray[TransferrableEventObj.THREADNAME_INDEX]).toEqual(1);
        expect(transferrableArray[TransferrableEventObj.FUNCTIONNAME_INDEX]).toEqual(2);
        expect(transferrableArray[TransferrableEventObj.LOCKNAME_INDEX]).toEqual(3);
        expect(transferrableArray[TransferrableEventObj.STARTTIME_HIGH_INDEX]).toEqual(0x0000beef);
        expect(transferrableArray[TransferrableEventObj.STARTTIME_LOW_INDEX]).toEqual(0xcafebabe);
        expect(transferrableArray[TransferrableEventObj.STACKDEPTH_INDEX]).toEqual(6);
        
        // JS only supports large numbers up to 2^53.
        // We will lose 11 bits of precision
        // To fix this, we'll have to change our parsing strategy
        expect(transferrableArray[TransferrableEventObj.ENDTIME_HIGH_INDEX]).toEqual(0x14382F53);
        expect(transferrableArray[TransferrableEventObj.ENDTIME_LOW_INDEX]).toEqual(0xD3831200);
    });
    
    it('should convert multiple eventObjs forwards and backwards', function() {
        var transferrableArray,
            eventObjArray = [
                {
                    threadName: 1,
                    functionName: 2,
                    lockName: 3,
                    startTime: 4,
                    endTime: 5,
                    stackDepth: 6
                },
                {
                    threadName: 7,
                    functionName: 8,
                    lockName: 9,
                    startTime: 10,
                    endTime: 11,
                    stackDepth: 12
                },
                {
                    threadName: 13,
                    functionName: 14,
                    lockName: 15,
                    startTime: 16,
                    endTime: 17,
                    stackDepth: 18
                }
            ];
        
        transferrableArray = TransferrableEventObj.toTransferrableArray(eventObjArray);
        expect(TransferrableEventObj.fromTransferrableArray(transferrableArray)).
            toEqual(eventObjArray);
    });
});
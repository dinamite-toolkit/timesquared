'use strict';

describe('DataProcessor', function () {
    
    it('should aggregate correct metadata for a single thread', function () {
        var DP = new DataProcessor();
        
        expect(DP.processLine("--> func_a 24 1 lock1")).toBe(true);
        expect(DP.processLine("--> func_b 24 3")).toBe(true);
        expect(DP.processLine("--> func_c 24 4 cache evict")).toBe(true);
        expect(DP.processLine("<-- func_c 24 5 cache evict")).toBe(true);
        expect(DP.processLine("<-- func_b 24 6")).toBe(true);
        expect(DP.processLine("<-- func_a 24 8 lock1")).toBe(true);
        
        expect(DP.getMetadata()).toEqual({
            startTime: 1,
            endTime: 8,
            minElapsedTime: 1,
            maxStackDepth: 3,
            threads: [24],
            events: ["func_a:::lock1", "func_b", "func_c:::cache_evict"],
            functions: ["func_a", "func_b", "func_c"],
            locknames: ["lock1", "", "cache_evict"],
            eventsReverseLookup: { "func_a:::lock1": 0, "func_b": 1, "func_c:::cache_evict": 2 },
            functionsReverseLookup: { "func_a": 0, "func_b": 1, "func_c": 2 },
            locknamesReverseLookup: { "lock1": 0, "" : 1, "cache_evict": 2 }
        });
    });
    
    it('should aggregate correct metadata for a multiple threads', function () {
        var DP = new DataProcessor();
        
        expect(DP.processLine("--> func_a 1 1 lock1")).toBe(true);
        expect(DP.processLine("--> func_a 1 3")).toBe(true);
        expect(DP.processLine("--> func_a 1 4 lock2")).toBe(true);
        expect(DP.processLine("<-- func_a 1 5 lock2")).toBe(true);
        expect(DP.processLine("<-- func_a 1 6")).toBe(true);
        expect(DP.processLine("<-- func_a 1 8 lock1")).toBe(true);
        
        expect(DP.processLine("--> func_ba 2 9 lock1")).toBe(true);
        expect(DP.processLine("--> func_bb 2 12")).toBe(true);
        expect(DP.processLine("--> func_bc 2 15 lock2")).toBe(true);
        expect(DP.processLine("--> func_bd 2 18 lock3")).toBe(true);
        expect(DP.processLine("<-- func_bd 2 21 lock3")).toBe(true);
        expect(DP.processLine("<-- func_bc 2 24 lock2")).toBe(true);
        expect(DP.processLine("<-- func_bb 2 27 ")).toBe(true);
        expect(DP.processLine("<-- func_ba 2 30 lock1")).toBe(true);
        
        expect(DP.getMetadata()).toEqual({
            startTime: 1,
            endTime: 30,
            minElapsedTime: 1,
            maxStackDepth: 4,
            threads: [1, 2],
            events: ["func_a:::lock1", "func_a", "func_a:::lock2", "func_ba:::lock1", "func_bb", "func_bc:::lock2", "func_bd:::lock3"],
            functions: ["func_a", "func_ba", "func_bb", "func_bc", "func_bd"],
            locknames: ["lock1", "", "lock2", "lock3"],
            eventsReverseLookup: {"func_a:::lock1": 0, "func_a": 1, "func_a:::lock2": 2, "func_ba:::lock1": 3, "func_bb": 4, "func_bc:::lock2": 5, "func_bd:::lock3": 6},
            functionsReverseLookup: {"func_a": 0, "func_ba": 1, "func_bb": 2, "func_bc": 3, "func_bd": 4},
            locknamesReverseLookup: {"lock1": 0, "": 1, "lock2": 2, "lock3": 3}
        });
    });
    
    it('should aggregate correct metadata for a multiple interwoven threads', function () {
        var DP = new DataProcessor();
        
        expect(DP.processLine("--> func_aa 1 3 lock1")).toBe(true);
        expect(DP.processLine("--> func_ba 2 4 lock1")).toBe(true);
        
        expect(DP.processLine("--> func_ab 1 6")).toBe(true);
        expect(DP.processLine("--> func_bb 2 7")).toBe(true);
        
        expect(DP.processLine("--> func_ac 1 9 lock2")).toBe(true);
        expect(DP.processLine("--> func_bc 2 10 lock2")).toBe(true);
        
        expect(DP.processLine("<-- func_ac 1 12 lock2")).toBe(true);
        expect(DP.processLine("--> func_bd 2 13 lock2")).toBe(true);
        
        expect(DP.processLine("<-- func_ab 1 15")).toBe(true);
        expect(DP.processLine("<-- func_bd 2 16 lock2")).toBe(true);

        expect(DP.processLine("<-- func_aa 1 18 lock1")).toBe(true);
        expect(DP.processLine("<-- func_bc 2 19 lock2")).toBe(true);
                
        expect(DP.processLine("<-- func_bb 2 25 ")).toBe(true);
        
        expect(DP.processLine("<-- func_ba 2 28 lock1")).toBe(true);
        
        expect(DP.getMetadata()).toEqual({
            startTime: 3,
            endTime: 28,
            minElapsedTime: 3,
            maxStackDepth: 4,
            threads: [1, 2],
            events: ["func_aa:::lock1", "func_ba:::lock1", "func_ab", "func_bb", "func_ac:::lock2", "func_bc:::lock2", "func_bd:::lock2"],
            functions: ['func_aa', 'func_ba', 'func_ab', 'func_bb', 'func_ac', 'func_bc', 'func_bd'],
            locknames: ['lock1', '', 'lock2'],
            eventsReverseLookup: { "func_aa:::lock1": 0, "func_ba:::lock1": 1, "func_ab": 2, "func_bb": 3, "func_ac:::lock2": 4, "func_bc:::lock2": 5, "func_bd:::lock2": 6 },
            functionsReverseLookup: { func_aa: 0, func_ba: 1, func_ab: 2, func_bb: 3, func_ac: 4, func_bc: 5, func_bd: 6 },
            locknamesReverseLookup: { lock1: 0, "" : 1, lock2: 2 }
        });
    });
    
    it('should aggregate correct metadata for a thread with trailing <--', function () {
        var DP = new DataProcessor();
        
        expect(DP.processLine("--> func_aa 1 1 lock1")).toBe(true);
        expect(DP.processLine("--> func_ab 1 3")).toBe(true);
        expect(DP.processLine("--> func_ac 1 4 lock2")).toBe(true);
        expect(DP.processLine("<-- func_ac 1 5 lock2")).toBe(true);
        expect(DP.processLine("<-- func_ab 1 6")).toBe(true);
        expect(DP.processLine("<-- func_aa 1 8 lock1")).toBe(true);
        
        expect(DP.processLine("<-- func_bd 2 21 lock3")).toBe(true);
        expect(DP.processLine("<-- func_bc 2 24 lock2")).toBe(true);
        expect(DP.processLine("<-- func_bb 2 27 ")).toBe(true);
        expect(DP.processLine("<-- func_ba 2 30 lock1")).toBe(true);
        
        expect(DP.getMetadata()).toEqual({
            startTime: 1,
            endTime: 30,
            minElapsedTime: 1,
            maxStackDepth: 4,
            threads: [1, 2],
            events: ["func_aa:::lock1", "func_ab", "func_ac:::lock2", "func_bd:::lock3", "func_bc:::lock2", "func_bb", "func_ba:::lock1"],
            functions: [ 'func_aa', 'func_ab', 'func_ac', 'func_bd', 'func_bc', 'func_bb', 'func_ba' ],
            locknames: [ 'lock1', '', 'lock2', 'lock3' ],
            eventsReverseLookup: { "func_aa:::lock1": 0, "func_ab": 1, "func_ac:::lock2": 2, "func_bd:::lock3": 3, "func_bc:::lock2": 4, "func_bb": 5, "func_ba:::lock1": 6 },
            functionsReverseLookup: { func_aa: 0, func_ab: 1, func_ac: 2, func_bd: 3, func_bc: 4, func_bb: 5, func_ba: 6 },
            locknamesReverseLookup: { lock1: 0, "" : 1, lock2: 2, lock3: 3 }
        });
    });
    
    it('should correctly filter commpressed regions', function() {
        var compressedRegions,
            DP = new DataProcessor();
        
        expect(DP.processLine("--> func_aa 1 1")).toBe(true); // +1
        expect(DP.processLine("--> func_aa 2 2")).toBe(true); // +2
        expect(DP.processLine("--> func_aa 3 4")).toBe(true); // +3
        expect(DP.processLine("--> func_aa 1 7")).toBe(true); // +4
        expect(DP.processLine("--> func_aa 2 11")).toBe(true); // +5
        expect(DP.processLine("--> func_aa 3 16")).toBe(true); // +4
        expect(DP.processLine("--> func_aa 1 20")).toBe(true); // +3
        expect(DP.processLine("--> func_aa 2 23")).toBe(true); // +2
        expect(DP.processLine("--> func_aa 3 25")).toBe(true); // +1
        expect(DP.processLine("--> func_aa 1 26")).toBe(true); 

        compressedRegions = DP.getCompressedRegions(0, 27, 5);
        expect(compressedRegions.length).toBe(0);
        
        compressedRegions = DP.getCompressedRegions(0, 27, 4);
        expect(compressedRegions.length).toBe(1);
        expect(compressedRegions[0]).toEqual(new TimeInterval(11, 16));
        
        compressedRegions = DP.getCompressedRegions(0, 27, 3);
        expect(compressedRegions.length).toBe(3);
        expect(compressedRegions[0]).toEqual(new TimeInterval(7, 11));
        expect(compressedRegions[1]).toEqual(new TimeInterval(11, 16));
        expect(compressedRegions[2]).toEqual(new TimeInterval(16, 20));
        
        compressedRegions = DP.getCompressedRegions(0, 27, 1);
        expect(compressedRegions.length).toBe(7);
    });
    
});

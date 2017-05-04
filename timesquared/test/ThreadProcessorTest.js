'use strict';

describe('ThreadProcessor', function () {
    
    it('should process a single event', function () {
        var tp = new ThreadProcessor(24);
        
        expect(
            tp.processEvent("-->", "__wt_fs_unlock", 10, "0x18e45b8")
        ).toBe(true);
        
        expect(tp.eventStream.length).toBe(1);
        expect(tp.eventStream[0].functionName).toBe("__wt_fs_unlock");
        expect(tp.eventStream[0].lockName).toBe("0x18e45b8");
        expect(tp.eventStream[0].startTime).toBe(10);
        expect(tp.eventStream[0].relativeStackDepth).toBe(0);
        expect(tp.events.length).toBe(0);
    });
    
    it('should process a pair of events', function () {
        var tp = new ThreadProcessor(24);
        
        expect(tp.processEvent("-->", "__wt_fs_unlock", 10, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_unlock", 11, "0x18e45b8")).toBe(true);
        
        expect(tp.eventStream.length).toBe(0);
        expect(tp.events.length).toBe(1);
        expect(tp.minStackDepth).toBe(0);
        expect(tp.maxStackDepth).toBe(0);
        expect(tp.events[0].functionName).toBe("__wt_fs_unlock");
        expect(tp.events[0].lockName).toBe("0x18e45b8");
        expect(tp.events[0].startTime).toBe(10);
        expect(tp.events[0].relativeStackDepth).toBe(0);
        expect(tp.events[0].endTime).toBe(11);
    });
    
    it('should process a small stack', function () {
        var tp = new ThreadProcessor(24);
        
        expect(tp.processEvent("-->", "__wt_fs_unlock", 10, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_spin_trylock", 11, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_spin_trylock", 12, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_unlock", 13, "0x18e45b8")).toBe(true);
        
        expect(tp.eventStream.length).toBe(0);
        expect(tp.events.length).toBe(2);
        expect(tp.minStackDepth).toBe(0);
        expect(tp.maxStackDepth).toBe(1);
        
        expect(tp.events[0].functionName).toBe("__wt_spin_trylock");
        expect(tp.events[0].lockName).toBe("0xdeadbeef");
        expect(tp.events[0].relativeStackDepth).toBe(1);
        expect(tp.events[0].startTime).toBe(11);
        expect(tp.events[0].endTime).toBe(12);
        
        expect(tp.events[1].functionName).toBe("__wt_fs_unlock");
        expect(tp.events[1].lockName).toBe("0x18e45b8");
        expect(tp.events[1].relativeStackDepth).toBe(0);
        expect(tp.events[1].startTime).toBe(10);
        expect(tp.events[1].endTime).toBe(13);
    });
    
    it('should process <-- without a previous -->', function () {
        var tp = new ThreadProcessor(24);
        
        expect(tp.processEvent("<--", "__wt_fs_unlock", 13, "0x18e45b8")).toBe(true);
        
        expect(tp.eventStream.length).toBe(0);
        expect(tp.events.length).toBe(1);
        expect(tp.minStackDepth).toBe(-1);
        expect(tp.maxStackDepth).toBe(-1);
        
        expect(tp.events[0].functionName).toBe("__wt_fs_unlock");
        expect(tp.events[0].lockName).toBe("0x18e45b8");
        expect(tp.events[0].relativeStackDepth).toBe(-1);
        expect(tp.events[0].startTime).toBe(0);
        expect(tp.events[0].endTime).toBe(13);
    });
    
    it('should process multiple <-- events without a previous -->', function () {
        var tp = new ThreadProcessor(24);
        
        expect(tp.processEvent("<--", "__wt_fs_unlock", 13, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("<--", "__wt_spin_trylock", 14, "0xdeadbeef")).toBe(true);
                
        expect(tp.eventStream.length).toBe(0);
        expect(tp.events.length).toBe(2);
        expect(tp.minStackDepth).toBe(-2);
        expect(tp.maxStackDepth).toBe(-1);
        
        expect(tp.events[0].functionName).toBe("__wt_fs_unlock");
        expect(tp.events[0].lockName).toBe("0x18e45b8");
        expect(tp.events[0].relativeStackDepth).toBe(-1);
        expect(tp.events[0].startTime).toBe(0);
        expect(tp.events[0].endTime).toBe(13);
        
        expect(tp.events[1].functionName).toBe("__wt_spin_trylock");
        expect(tp.events[1].lockName).toBe("0xdeadbeef");
        expect(tp.events[1].relativeStackDepth).toBe(-2);
        expect(tp.events[1].startTime).toBe(0);
        expect(tp.events[1].endTime).toBe(14);
    });
    
    it('should process a small stack ending with a hanging <--', function () {
        var tp = new ThreadProcessor(24);
        
        expect(tp.processEvent("-->", "__wt_fs_unlock", 10, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_spin_trylock", 11, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_spin_trylock", 12, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_unlock", 13, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("<--", "__evict_get_ref", 14, "")).toBe(true);
        
        expect(tp.eventStream.length).toBe(0);
        expect(tp.events.length).toBe(3);
        expect(tp.minStackDepth).toBe(-1);
        expect(tp.maxStackDepth).toBe(1);
        
        expect(tp.events[0].functionName).toBe("__wt_spin_trylock");
        expect(tp.events[0].lockName).toBe("0xdeadbeef");
        expect(tp.events[0].relativeStackDepth).toBe(1);
        expect(tp.events[0].startTime).toBe(11);
        expect(tp.events[0].endTime).toBe(12);
        
        expect(tp.events[1].functionName).toBe("__wt_fs_unlock");
        expect(tp.events[1].lockName).toBe("0x18e45b8");
        expect(tp.events[1].relativeStackDepth).toBe(0);
        expect(tp.events[1].startTime).toBe(10);
        expect(tp.events[1].endTime).toBe(13);
        
        expect(tp.events[2].functionName).toBe("__evict_get_ref");
        expect(tp.events[2].lockName).toBe("");
        expect(tp.events[2].relativeStackDepth).toBe(-1);
        expect(tp.events[2].startTime).toBe(0);
        expect(tp.events[2].endTime).toBe(14);
    });
    
    it('should process new stacks following a hanging <--', function () {
        var tp = new ThreadProcessor(24);
        
        expect(tp.processEvent("<--", "__wt_fs_unlock", 13, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_fs_lock", 14, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_spin_trylock", 15, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_spin_trylock", 16, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_lock", 17, "0x18e45b8")).toBe(true);
                
        expect(tp.eventStream.length).toBe(0);
        expect(tp.events.length).toBe(3);
        expect(tp.minStackDepth).toBe(-1);
        expect(tp.maxStackDepth).toBe(0);
        
        expect(tp.events[0].functionName).toBe("__wt_fs_unlock");
        expect(tp.events[0].lockName).toBe("0x18e45b8");
        expect(tp.events[0].relativeStackDepth).toBe(-1);
        expect(tp.events[0].startTime).toBe(0);
        expect(tp.events[0].endTime).toBe(13);
        
        expect(tp.events[1].functionName).toBe("__wt_spin_trylock");
        expect(tp.events[1].lockName).toBe("0xdeadbeef");
        expect(tp.events[1].relativeStackDepth).toBe(0);
        expect(tp.events[1].startTime).toBe(15);
        expect(tp.events[1].endTime).toBe(16);
        
        expect(tp.events[2].functionName).toBe("__wt_fs_lock");
        expect(tp.events[2].lockName).toBe("0x18e45b8");
        expect(tp.events[2].relativeStackDepth).toBe(-1);
        expect(tp.events[2].startTime).toBe(14);
        expect(tp.events[2].endTime).toBe(17);
    });
    
    it('should process basic metadata', function () {
        var tp = new ThreadProcessor(24),
            metadata;
        
        expect(tp.processEvent("-->", "__wt_fs_unlock", 10, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_spin_trylock", 11, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_spin_trylock", 12, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_unlock", 13, "0x18e45b8")).toBe(true);
        
        metadata = tp.getMetadata();
        expect(metadata.stackDepth).toBe(2);
        expect(metadata.minElapsedTime).toBe(1);
    });
    
    it('should process basic metadata with trailing <--', function () {
        var tp = new ThreadProcessor(24),
            metadata;
        
        expect(tp.processEvent("-->", "__wt_fs_lock", 14, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_spin_trylock", 15, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_spin_trylock", 16, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_lock", 17, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_unlock", 18, "0x18e45b8")).toBe(true);
        
        metadata = tp.getMetadata();
        expect(metadata.stackDepth).toBe(3);
        expect(metadata.minElapsedTime).toBe(1);
    });
    
    it('should process basic metadata and events without trailing <--', function () {
        var tp = new ThreadProcessor(24),
            metadata,
            eventList = [];
        
        expect(tp.processEvent("-->", "__wt_fs_lock", 14, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_spin_trylock", 15, "0xdeadbeef")).toBe(true);
        
        metadata = tp.getMetadata();
        expect(metadata.stackDepth).toBe(2);
        expect(metadata.minElapsedTime).toBe(1);
        
        eventList = tp.getProcessedEventsArray({
            startTime: 0,
            endTime: 20,
            functionsReverseLookup: {"__wt_fs_lock": 77, "__wt_spin_trylock": 78},
            locknamesReverseLookup: {"0x18e45b8": 88, "0xdeadbeef": 89}
        });
        
        expect(eventList[0].threadName).toEqual(24);
        expect(eventList[0].functionName).toEqual(78);
        expect(eventList[0].startTime).toEqual(15);
        expect(eventList[0].endTime).toEqual(20);
        expect(eventList[0].stackDepth).toEqual(1);
        
        expect(eventList[1].threadName).toEqual(24);
        expect(eventList[1].functionName).toEqual(77);
        expect(eventList[1].startTime).toEqual(14);
        expect(eventList[1].endTime).toEqual(20);
        expect(eventList[1].stackDepth).toEqual(0);
    });
    
    
    it('should stream out processed events: basic', function () {
        var tp = new ThreadProcessor(24),
            eventList = [];
        
        expect(tp.processEvent("-->", "__wt_fs_lock", 14, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("-->", "__wt_spin_trylock", 15, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_spin_trylock", 16, "0xdeadbeef")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_lock", 17, "0x18e45b8")).toBe(true);
        expect(tp.processEvent("<--", "__wt_fs_unlock", 18, "0x18e45b8")).toBe(true);
        
        eventList = tp.getProcessedEventsArray({
            startTime: 0,
            endTime: 20,
            functionsReverseLookup: {"__wt_fs_lock": 77, "__wt_spin_trylock": 78, "__wt_fs_unlock": 79},
            locknamesReverseLookup: {"0x18e45b8": 88, "0xdeadbeef": 89}
        });
        
        expect(eventList[0].threadName).toEqual(24);
        expect(eventList[0].functionName).toEqual(78);
        expect(eventList[0].startTime).toEqual(15);
        expect(eventList[0].endTime).toEqual(16 );
        expect(eventList[0].stackDepth).toEqual(2);
        
        expect(eventList[1].threadName).toEqual(24);
        expect(eventList[1].functionName).toEqual(77);
        expect(eventList[1].startTime).toEqual(14);
        expect(eventList[1].endTime).toEqual(17);
        expect(eventList[1].stackDepth).toEqual(1);
        
        expect(eventList[2].threadName).toEqual(24);
        expect(eventList[2].functionName).toEqual(79);
        expect(eventList[2].startTime).toEqual(0);
        expect(eventList[2].endTime).toEqual(18);
        expect(eventList[2].stackDepth).toEqual(0);
    });
    
    it('should process lock names with spaces', function () {
        var tp = new ThreadProcessor(24);
        
        expect(
            tp.processEvent("-->", "__wt_fs_unlock", 10, "cache evict")
        ).toBe(true);
        expect(
            tp.processEvent("-->", "__wt_fs_unlock", 10, "cache evict wow")
        ).toBe(true);
        
        expect(tp.eventStream.length).toBe(2);
        expect(tp.eventStream[0].lockName).toBe("cache evict");
        expect(tp.eventStream[1].lockName).toBe("cache evict wow");
    });
    
});

"use strict";

var runQuery;

var createHistoryElement = function (query) {
    var rootdiv = $("#history")[0],
        div = document.createElement('div'),
        p = document.createElement('p'),
        pasteBtn = document.createElement('button'),
        closeBtn = document.createElement('button'),
        runBtn = document.createElement('button');
    
    div.className = "historyElement";
    
    $(p).text(query);
    
    pasteBtn.className = "btn btn-default historyBtn";
    closeBtn.className = "btn btn-default historyBtn";
    runBtn.className = "btn btn-default historyBtn";
    
    $(pasteBtn).html('<i class="glyphicon glyphicon-paste"></i>');
    $(pasteBtn).on('click', function () {
        $("#dbQueryInput").val(query);
    });
    
    $(closeBtn).html('<i class="glyphicon glyphicon-remove"></i>');
    $(closeBtn).on('click', function () {
        rootdiv.removeChild(div);
    });
    
    $(runBtn).html('<i class="glyphicon glyphicon-arrow-right"></i>');
    $(runBtn).on('click', function () {
        runQuery(query, false);
        $(div).detach();
        $(rootdiv).prepend(div);
    });
    
    $(div).append(closeBtn);
    $(div).append(pasteBtn);
    $(div).append(runBtn);
    $(div).append(p);
    $(rootdiv).prepend(div);
};

runQuery = function (query, createHistory) {
    window.open("/render?" + query);
    if (createHistory) {
        createHistoryElement(query);
    }
};

$(document).ready( function () {
    
    if (window.Worker) {
        console.log("WebWorkers supported!");
    } else {
        console.log("WebWorkers not supported");
    }
    
    $('#dbQueryInput').keydown(function (e) {
        // CTRL + ENTER pressed while typing query
        if (e.ctrlKey && e.keyCode === 13) {
            runQuery($("#dbQueryInput").val(), true);
        }
    });
    $("#dbQuery").on('click', function () {
        runQuery($("#dbQueryInput").val(), true);
    });
    $('#dbQuery').popover({
        html: true,
        container: 'body',
        content: $('#dbQueryPopover').html()
    });
    
    
    /* Create some default queries */
    createHistoryElement("with lbt as (select time from trace where id=20 and dir=0), ubt as (select time from trace where id=20 and dir=1) select dir, func, tid, time from trace where time>= (select time from lbt) and time<=(select time from ubt)");
    createHistoryElement("SELECT dir, func, tid, time FROM trace LIMIT 2000");
    createHistoryElement("SELECT dir, func, tid, time FROM trace LIMIT 10000");
    
    Database.getMetadata()
        .then( function (metadata) {
            console.log(metadata);
            $("#traceMetadata").append($(document.createElement('tr')).html("<td>Number of Events</td> <td>" + metadata.numEvents + "</td>"));
            $("#traceMetadata").append($(document.createElement('tr')).html("<td>Number of Threads</td> <td>" + metadata.numThreads + "</td>"));
            $("#traceMetadata").append($(document.createElement('tr')).html("<td>Trace start</td> <td>" + metadata.startTime + " ns</td>"));
            $("#traceMetadata").append($(document.createElement('tr')).html("<td>Trace end</td> <td>" + metadata.endTime + " ns</td>"));
        })
        .catch( function (err) {
            console.log("Error: " + err);
        });
});
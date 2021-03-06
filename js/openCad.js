/*!
 * Open source CAD system for RolePlaying Communities. 
 * Copyright (C) 2017 Shane Gill
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 * This program comes with ABSOLUTELY NO WARRANTY; Use at your own risk.
 */

// Full Screen Functionality
function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
    (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {  
        document.documentElement.requestFullScreen();  
        } else if (document.documentElement.mozRequestFullScreen) {  
        document.documentElement.mozRequestFullScreen();  
        } else if (document.documentElement.webkitRequestFullScreen) {  
        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
        }  
    } else {  
        if (document.cancelFullScreen) {  
        document.cancelFullScreen();  
        } else if (document.mozCancelFullScreen) {  
        document.mozCancelFullScreen();  
        } else if (document.webkitCancelFullScreen) {  
        document.webkitCancelFullScreen();  
        }  
    }  
}

// When the user presses enter in ncic_name it does a search
$("#ncic_name").keyup(function(event){
    if(event.keyCode == 13){
        $("#ncic_name_btn").click();
    }
});

// When the user presses enter in ncic_plate it does a search
$("#ncic_plate").keyup(function(event){
    if(event.keyCode == 13){
        $("#ncic_plate_btn").click();
    }
});

// Handles the NCIC Plate Lookup on dispatch.php
$('#ncic_plate_btn').on('click', function(e) {
    var plate = document.getElementById('ncic_plate').value;
    $('#ncic_plate_return').empty();

    $.ajax({
        cache: false,
        type: 'POST',
        url: '../actions/ncic.php',
        data: {'ncicPlate': 'yes',
                'ncic_plate' : plate},

        success: function(result) 
        {
        console.log(result);
        data = JSON.parse(result);

        if (data['noResult'] == "true")
        {
            $('#ncic_plate_return').append("<p style=\"color:red;\">PLATE NOT FOUND");
        }
        else
        {
            var insurance_status = "";
            if (data['veh_insurance'] == "VALID")
            {
                insurance_status = "<span style=\"color: green;\">Valid</span>";
            }
            else
            {
            insurance_status = "<span style=\"color: red;\">"+data['veh_insurance']+"</span>";
            }

            var notes = "";
            if (data['notes'] == "")
            {
                notes = "NO VEHICLE NOTES";
            }
            else
            {
            notes = "<span style=\"font-weight: bold;\">"+data['notes']+"</span>";
            }

            var flags = "";
            if (data['flags'] == "NONE")
            {
                flags = "<span style=\"color: green;\">None</span>";
            }
            else
            {
            flags = "<span style=\"color: red;\">"+data['flags']+"</span>";
            }


            $('#ncic_plate_return').append("Plate: "+data['plate']+"<br/>Color: "+data['veh_color']+"<br/>Make: "+data['veh_make']+"<br/>Model: "+data['veh_model']+"<br/>Owner: "+data['veh_ro']
            +"<br/>Insurance: "+insurance_status+"<br/>Flags: "+flags+"<br/><br/>Notes: "+notes);

            $("#ncic_plate_return").attr("tabindex",-1).focus();
        }
        },

        error:function(exception){alert('Exeption:'+exception);}
    });
});

// Handles the NCIC Name Lookup on dispatch.php
$('#ncic_name_btn').on('click', function(e) {
    var name = document.getElementById('ncic_name').value;
    $('#ncic_name_return').empty();

    $.ajax({
        cache: false,
        type: 'POST',
        url: '../actions/ncic.php',
        data: {'ncicName': 'yes',
                'ncic_name' : name},

        success: function(result) 
        {
        console.log(result);
        data = JSON.parse(result);

        var textarea = document.getElementById("ncic_name_return");

        if (data['noResult'] == "true")
        {
            $('#ncic_name_return').append("<p style=\"color:red;\">NAME NOT FOUND");
        }
        else
        {
            if (data['noWarrants'] == "true")
            {
            var warrantText = "&nbsp;&nbsp;&nbsp;&nbsp;<span style=\"color: green\">NO WARRANTS</span><br/>";
            }
            else
            {
            var warrantText = "";
            warrantText += "    Count: "+data.warrant_name.length+"<br/>";
            for (i=0; i<data.warrant_name.length; i++)
            {
                warrantText += "<span style=\"color:red\">&nbsp;&nbsp;&nbsp;&nbsp;"+data.warrant_name[i] + "</span><br/>";  
            }
            }

            if (data['noCitations'] == "true")
            {
            var citationText = "&nbsp;&nbsp;&nbsp;&nbsp;<span style=\"color: green\">NO CITATIONS</span>";
            }
            else
            {
            var citationText = "";
            citationText += "    Count: "+data.citation_name.length+"<br/>";
            for (i=0; i<data.citation_name.length; i++)
            {
                citationText += "&nbsp;&nbsp;&nbsp;&nbsp;<span style=\"color: #F78F2B\">"+data.citation_name[i]+"</span><br/>";  
            }
            }

            var dl_status_text = "";
            if (data['dl_status'] == "Valid")
            {
                dl_status_text = "<span style=\"color: green;\">Valid</span>";
            }
            else
            {
            dl_status_text = "<span style=\"color: red;\">"+data['dl_status']+"</span>";
            }

            $('#ncic_name_return').append("Name: "+data['first_name']+" "+data['last_name']+"<br/>DOB: "+data['dob']+"<br/>Age: "+data['age']+"<br/>Sex: "+data['sex']
            +"<br/>Race: "+data['race']+"<br/>Hair Color: "+data['hair_color']
            +"<br/>Build: "+data['build']
            +"<br/>Address: "+data['address']
            +"<br/>DL Status: "+dl_status_text
            +"<br/><br/>Warrants: <br/>"+warrantText+"<br/>Citations:<br/>"+citationText);

            $("#ncic_name_return").attr("tabindex",-1).focus();
        }
        },

        error:function(exception){alert('Exeption:'+exception);}
    });
});

// Handles autocompletion on the new call form
$( ".txt-auto" ).autocomplete({
    source: "../actions/dispatchActions.php",
    minLength: 2
});
$( ".txt-auto" ).autocomplete( "option", "appendTo", ".newCallForm" );

$( ".txt-auto2" ).autocomplete({
    source: "../actions/dispatchActions.php",
    minLength: 2
});
$( ".txt-auto2" ).autocomplete( "option", "appendTo", ".newCallForm" );

// Handles submission of the new call form
$(function() {
    $('.newCallForm').submit(function(e) {
        e.preventDefault(); // avoid to execute the actual submit of the form.

        $.ajax({
            type: "POST",
            url: "../actions/dispatchActions.php",
            data: {
                newCall: 'yes',
                details: $("#"+this.id).serialize()
            },
            success: function(response) 
            {
            console.log(response);
            if (response == "SUCCESS")
            {
                
                $('#closeNewCall').trigger('click');

                new PNotify({
                title: 'Success',
                text: 'Successfully created call',
                type: 'success',
                styling: 'bootstrap3'
                }); 

                //Reset the form
                $('.newCallForm').find('input:text, textarea').val('');
                $('.newCallForm').find('select').val('').selectpicker('refresh');

                getCalls();
            }
            
            },
            error : function(XMLHttpRequest, textStatus, errorThrown)
            {
            console.log("Error");
            }
            
        }); 
    });
});

// Handles the unavailable unit poller for the dispatch page
function getUnAvailableUnits() {
$.ajax({
        type: "GET",
        url: "../actions/api.php",
        data: {
            getUnAvailableUnits: 'yes'
        },
        success: function(response) 
        {
        $('#unAvailableUnits').html(response);
        $('#unAvailableUnitsTable').DataTable({
            searching: false,
            scrollY: "200px",
            lengthMenu: [[4, -1], [4, "All"]]
                });
        setTimeout(getUnAvailableUnits, 5000);
        
        },
        error : function(XMLHttpRequest, textStatus, errorThrown)
        {
        console.log("Error");
        }
        
    }); 
}

// Handles the ajax query to auto populate the new call modal with available units
$('#newCall').on('show.bs.modal', function(e) {
    var $modal = $(this), userId = e.relatedTarget.id;

    $.ajax({
        cache: false,
        type: 'GET',
        url: '../actions/api.php',
        data: {'getActiveUnits': 'yes'},
        success: function(result) 
        {
        data = JSON.parse(result);

        var mymodal = $('#newCallForm');      
        var select = mymodal.find('#unit_1');
        select.empty();
        var select2 = mymodal.find('#unit_2');
        select2.empty();

        $.each(data, function(key, value) {
            select.append($("<option/>")
                        .val(key)
                        .text(value));
            
            select2.append($("<option/>")
                        .val(key)
                        .text(value));
        });

        select.selectpicker('refresh');
        select2.selectpicker('refresh');
        },

        error:function(exception){alert('Exeption:'+exception);}
    });
});

// Handles the call details panel for the dispatch and responder pages
$('#callDetails').on('show.bs.modal', function(e) {
    var $modal = $(this), callId = e.relatedTarget.id;

    $.ajax({
        cache: false,
        type: 'GET',
        url: '../actions/api.php',
        data: {'getCallDetails': 'yes',
                'callId' : callId},
        success: function(result) 
        {
        data = JSON.parse(result);

        var mymodal = $('#callDetails');
        mymodal.find('input[name="call_id_det"]').val(data['call_id']);
        mymodal.find('input[name="call_type_det"]').val(data['call_type']);
        mymodal.find('input[name="call_street1_det"]').val(data['call_street1']);
        mymodal.find('input[name="call_street2_det"]').val(data['call_street2']);
        mymodal.find('input[name="call_street3_det"]').val(data['call_street3']);
        mymodal.find('div[name="call_narrative"]').html('');
        mymodal.find('div[name="call_narrative"]').append(data['narrative']);

        },

        error:function(exception){alert('Exeption:'+exception);}
    });
}); 

// Clears calls
function clearCall(btn_id) {
    var $tr = $(this).closest('tr');
    var r = confirm("Are you sure you want to clear this call? This will mark all assigned units on call active.");

    if (r == true)
    {
        $.ajax({
        type: "POST",
        url: "../actions/dispatchActions.php",
        data: {
            clearCall: 'yes',
            callId: btn_id
        },
        success: function(response) 
        {
            console.log(response);
            $tr.find('td').fadeOut(1000,function(){ 
                $tr.remove();                    
            });
            
            new PNotify({
            title: 'Success',
            text: 'Successfully cleared call',
            type: 'success',
            styling: 'bootstrap3'
            }); 

            getCalls();
        },
        error : function(XMLHttpRequest, textStatus, errorThrown)
        {
            console.log("Error");
        }
        
        }); 
    }
    else
    {
        return; // Do nothing
    }
}

// Gets calls
function getCalls() {
    $.ajax({
        type: "GET",
        url: "../actions/api.php",
        data: {
            getCalls: 'yes'
        },
        success: function(response) 
        {
        $('#live_calls').html(response);
        setTimeout(getCalls, 5000);
        
        },
        error : function(XMLHttpRequest, textStatus, errorThrown)
        {
        console.log("Error");
        }
        
    }); 
}

// Handles tones buttons
function priorityTone(type)
{
    if (type == "single")
    {
        var priorityButton = $('#priorityTone');
        var value = priorityButton.val();

        if (value == "0")
        {
            priorityButton.val("1");
            priorityButton.text("Priority Tone - ACTIVE");
            sendTone("priority", "start");
        }
        else if (value == "1")
        {
            sendTone("priority", "stop");
            priorityButton.val("0");
            priorityButton.text("Priority Tone");
        }
    }
    else if (type == "recurring")
    {
        var recurringButton = $('#recurringTone');
        var value = recurringButton.val();

        if (value == "0")
        {
            recurringButton.val("1");
            recurringButton.text("10-3 Tone - ACTIVE");
            sendTone("recurring", "start");
        }
        else if (value == "1")
        {
            sendTone("recurring", "stop");
            recurringButton.val("0");
            recurringButton.text("10-3 Tone");
        }
    }

 function sendTone(name, action)
 {
    console.log(name + ' ' + action);

    $.ajax({
        type: "POST",
        url: "../actions/api.php",
        data: {
            setTone: 'yes',
            tone: name,
            action: action
        },
        success: function(response) 
        {
            if (response == "SUCCESS START")
            {
                new PNotify({
                title: 'Success',
                text: 'Successfully started tone',
                type: 'success',
                styling: 'bootstrap3'
                });
            }
            
            else if (response == "SUCCESS STOP")
            {
                new PNotify({
                title: 'Success',
                text: 'Successfully stopped tone',
                type: 'success',
                styling: 'bootstrap3'
                });
            }

        },
        error : function(XMLHttpRequest, textStatus, errorThrown)
        {
        console.log("Error");
        }
        
    });
 } 
}

// Function to check and see if there are any active tones 
function checkTones()
{
    $.ajax({
        type: "GET",
        url: "../actions/api.php",
        data: {
            checkTones: 'yes'
        },
        success: function(response) 
        {
            data = JSON.parse(response);
            console.log(data);

            if (data['recurring'] == "ACTIVE")
            {
                var tag = $('#recurringToneAudio')[0];
                tag.play();

                PNotify.removeAll();

                new PNotify({
                title: 'Priority Traffic',
                text: 'Priority Traffic Only',
                type: 'error',
                hide: false,
                styling: 'bootstrap3',
                buttons: {
                    closer: false,
                    sticker: false
                }
                });


            }

            setTimeout(checkTones, 7000);        
        },
        error : function(XMLHttpRequest, textStatus, errorThrown)
        {
        console.log("Error");
        }
        
    })
}   

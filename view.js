// ---- Define your dialogs  and panels here ----



// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});

// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 

const filePath = "/C/presentation_documents/important_file.txt";

let effective_permissions = define_new_effective_permissions("effective_perm", add_info_column = true, which_permissions = null);
$('#sidepanel').append(effective_permissions);
$('#effective_perm').attr('username', 'administrator');
$('#effective_perm').attr('filepath', filePath);

let user_select_for_perm = define_new_user_select_field("user_select_perm", "Select User", function(selected_user) { 
    $('#effective_perm').attr('username', selected_user);
});
$('#sidepanel').append(user_select_for_perm);

let dialog = define_new_dialog('permission-dialog', 'Permission Information', {});
$('.fa-info-circle').click(function(){
    const file_path = $('#effective_perm').attr('filepath');
    const username = $('#effective_perm').attr('username');
    const permissionName = $(this).attr('permission_name'); // Replace with the correct attribute name
    const fileObject = path_to_file[file_path];
    const userObject = all_users[username];
    const explanation = allow_user_action(fileObject, userObject, permissionName, true);
    
    const explanationText = get_explanation_text(explanation);
    const currentDialog = dialog.dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });
    currentDialog.text(explanationText);
    currentDialog.dialog('open');
});


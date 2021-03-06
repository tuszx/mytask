document.write('<script type="text/javascript" src="../model/User.js"></script>');
document.write('<script type="text/javascript" src="../model/Task.js"></script>');
document.write('<script type="text/javascript" src="../model/Project.js"></script>');

$(document).ready(function (e) {

  initPaging();
  initProjectList(0);

  // init daterange
  $('#dueDate').daterangepicker({
    "singleDatePicker": true,
    "autoApply": true,
     "locale": {
        "format": "DD/MM/YYYY",
        "daysOfWeek": ["2","3","4","5","6","7","CN"
        ],
        "monthNames": ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"
        ],
        "firstDay": 0
    },
  });

  // show tip
  if(userInfo.show_tip){
    $('#taskContent').attr({'data-toggle': "modal", "data-target": "#showTip"})
  }

  $('#dontShowTip').click(function(e){
    userInfo.show_tip = 0;
    console.log(userInfo)
    User.update(userInfo);
    $('#taskContent').attr({'data-toggle': "", "data-target": ""})
  });

  // create mode
  $('#createTaskForm').click(function (e) {
    $('#dueDate').val(moment().format('DD/MM/YYYY'));
    $('#startDoDate').val(moment().format('DD/MM/YYYY'));
    $('#endDoDate').val(moment().format('DD/MM/YYYY'));
    selectStatus('1');
    $('#projectName').val('');
    $('#save').attr('value','0');
    $('#taskContent').val("## ");

    btnAction('create');

  })

  // init create form when load
  $('#createTaskForm').trigger('click');

  // paging
  $('.pagination li a').click(function(e){
    var pageId = parseInt($(this).attr('value'));
    var offset = pageId * 10;
    if(pageId > 0) offset += 1;
    initProjectList(offset);
  });

  // selected project list
  $('#projectList').on('click', ".list-group-item", function(e){

    var id = $(this).attr('value');
    if(!id) id = $('#projectList .list-group-item').first();
    $('#projectList .list-group-item').removeClass('list-group-item-info');
    $(this).addClass('list-group-item-info')
    getProjectInfo(id);
  });


});

function initProjectList(offset){

    // empty data
    $('#projectList').not('.active').empty();
    $('#projectList').html('<a href="#" class="list-group-item active" style="pointer-events: none"><i class="glyphicon glyphicon-list-alt" ></i> <b>Danh sách dự án</b></a>');
    // init project list
    var taskList = task_list();
    var projectList = project_list(offset);

    if(project_list){
      for(var i = 0; i < projectList.length; i++){
        var projectName = projectList[i].name ? projectList[i].name : "Tên chưa xác định";
        var projectDueDate = projectList[i].due_date ? projectList[i].due_date : "";
        var statusLabelType = "", statusLabelContent ="";
        
        switch(projectList[i].status){
          case '1': 
            statusLabelType ="label-info";
            statusLabelContent = "Đang chờ";
            break;

          case '2': 
            statusLabelType ="label-primary";
            statusLabelContent = "Đang làm";
            break;

          case '3': 
            statusLabelType ="label-success";
            statusLabelContent = "Hoàn thành";
            break;

          case '0': 
            statusLabelType ="label-danger";
            statusLabelContent = "Quá hạn";
            break;

          case '-1': 
            statusLabelType ="label-default";
            statusLabelContent = "Hủy bỏ";
            break;
        }

        var projectHTML = "<a href='javascript:void(0)' value='" + projectList[i].$loki + "' class='list-group-item'>" + projectDueDate + " - <b>" + projectName + "<span class='label " +  statusLabelType + " pull-right'>" + statusLabelContent +"</span></b></a>";
        $('#projectList').append(projectHTML);
      }
    }
  }


function getProjectInfo(id){
  
  var projectInfo = project_info(id);
  var taskInfo = task_info(id);
  if(!projectInfo || !taskInfo || projectInfo.length == 0) return;

  $('#dueDate').val(projectInfo[0].due_date);
  selectStatus(projectInfo[0].status);
  $("#projectName").val(projectInfo[0].name);
  $('#save').attr('value',id);
}


function selectStatus(status){

  $('#btnGroup .btn').removeClass('btn-info');
  $('#btnGroup .btn').removeClass('btn-primary');
  $('#btnGroup .btn').removeClass('btn-success');
  $('#btnGroup .btn').removeClass('btn-danger');
  $('#btnGroup .btn').removeClass('btn-danger');
  $('#btnGroup .btn').addClass('btn-default');

  $('#btnGroup').attr('active-status', status);

  switch(status){
    case '1': 
      $('#btnGroup [value="1"]').addClass('btn-info');
      break;

    case '2':
      $('#btnGroup [value="2"]').addClass('btn-primary');
      break;

    case '3':
      $('#btnGroup [value="3"]').addClass('btn-success');
      break;
    case '0':
      $('#btnGroup [value="0"]').addClass('btn-danger')
      break;
    case '-1':
      $('#btnGroup [value="-1"]').removeClass('btn-default');
      $('#btnGroup [value="-1"]').removeClass('btn-info');
      $('#btnGroup [value="-1"]').removeClass('btn-primary');
      $('#btnGroup [value="-1"]').removeClass('btn-success');
      $('#btnGroup [value="-1"]').removeClass('btn-danger');
      $('#btnGroup [value="-1"]').removeClass('btn-danger');
      break;
  }
}

// get status
$(".status-btn .btn").click(function(e){
  var id = $(this).attr('value');
  selectStatus(id);
  $('#btnGroup').attr('active-status', id)
})

// cancel create
$('#cancelCreateTask').click(function(){
  var id = $('#projectList .list-group-item-info').attr('value');
  getProjectInfo(id);
  btnAction('cancel');
})

// show hide action button
function btnAction(action){
  switch(action){
    case 'create':
      $('#createTaskForm').hide();
      $('#cancelCreateTask').show();
      $('#deleteTask').hide();
      break;

    case 'cancel':
      $('#createTaskForm').show();
      $('#cancelCreateTask').hide();
      $('#deleteTask').show();

    case 'view':
      $('#createTaskForm').show();
      $('#cancelCreateTask').hide();
      $('#deleteTask').show();
  }
}

// format content
$('#taskContent').keypress(function(e){

    setTimeout(function(){  
    var enterKey = e.keyCode;
    if(enterKey == 13){
      var content = $('#taskContent').val();
      content += "## ";
      $('#taskContent').val(content);
    }
  }, 0);
});

// save data
$('#save').click(function(){

  var contentString = $('#taskContent').val();
  
  var status = $('#btnGroup').attr('active-status');

  var taskParam = [];
  
  // validate
  if(!$('#projectName').val() || $('#projectName').val().trim().length == 0){
    toast('Ê! tên dự án của em đâu rồi?');
    return;
  }
  if(!contentString || contentString.toString().trim().length == 0){  
    toast('Chưa nhập nội dung công việc bạn êi');
    return;
  }

    var contentArray = contentString.toString().split('## ');
    for(var i = 0; i < contentArray.length; i++){
      taskParam.push({
        content: contentArray[i]
      })
    }

    var projectParams = {
      name: $('#projectName').val(),
      due_date : $('#dueDate').val(),
      status : status
    };

  // create or udpate

  var id = parseInt($('#save').attr('value'));

  if(id > 0){ // update
   projectParams = project_info(id)[0];
    
    projectParams.name = $('#projectName').val();
    projectParams.due_date = $('#dueDate').val();
    projectParams.status = status;
    project_update(projectParams);

  } else { // create new
    project_create(projectParams)
  }

  // reload list
  initProjectList();

})

function initPaging(){
  var count = project_count();
  var int = Math.floor(count / 10);
  var fre = count % 10;
  var numOfPage = int;
  if(fre > 0) numOfPage += 1;

  var previous = '<li><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
  var next = '<li><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
  var content = '';
  for(var i = 0; i < numOfPage; i++){
    content += '<li><a href="javascript:void(0)" value="'+ [i] +'">'+ [i+1] +'</a></li>'
  }

  // if(numOfPage <= 1){
  //   next = "";
  //   previous = ""; 
  //   content = '';
  // }

  $('.pagination').html(previous + content + next);
}

// show err toast
function toast(message){
  $.toast({
    text : message,
    loader: false,
    showHideTransition : 'fade',
    position: "top-right",
    hideAfter: 1000
  });
}
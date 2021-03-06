$(document).ready(function(){
    fnGetAllCustomerList();
});
function fnGetAllCustomerList(){
    $.ajax({ 
        url: "/api/customer",
        method: "GET", 
        dataType: "json",
        success:success,
        fail:fail
    });
    function success(data){
        fnRenderCustomerList(data);
    }
    function fail(err){
        console.log(err);
    }
}

//렌더링후 이벤트바인드
//순수 data만 갖고 렌더링
function fnRenderCustomerList(data){
    var source=$("#tbCustomerList-template").html();
    var renderData={
        customerList:data
    }
    if ($.fn.dataTable.isDataTable('#tbCustomerList')){
        $('#tbCustomerList').dataTable().fnDestroy();
    }
    var template=Handlebars.compile(source);
    var html=template(renderData);
    $("#tbCustomerListBody").html(html);
    $("[id=tdCustomerListPoint]").each((idx,td)=>{
        $(td).text('￦'+$.number($(td).text(),0,','));
    });
    $('#tbCustomerList').dataTable({
        "language": {
            "decimal": "",
            "emptyTable": "등록된 내용이 없습니다.",
            "info": "",
            "infoEmpty": "",
            "infoFiltered": "",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "_MENU_",
            "loadingRecords": "로드 중 ...",
            "processing": "처리 중 ...",
            "search": "검색:",
            "zeroRecords": "일치하는 내용이 없습니다.",
            "paginate": {
                "first": "처음",
                "last": "마지막",
                "next": "다음",
                "previous": "이전"
            },
            "aria": {
                "sortAscending": ": 오름차순으로 정렬",
                "sortDescending": ": 내림차순으로 정렬"
            }
        },
        "drawCallback":fnTableEventBind,
        "pageLength": 50

    });

    fnEventBind();
}
function fnUpdateCustomer(customer){
     //PUT
     $.ajax({ 
        url: "/api/customer/"+customer.id,
        method: "PUT",
        data:customer,
        dataType: "json",
        success:success,
        fail:fail
    });
    function success(data){
        
        $("#modalCustomer").modal('hide');
        fnGetAllCustomerList();
    }
    function fail(err){
        console.log(err);
    }
}
function fnEventBind(){
    $("#inputCustomerPoint").number(true,0);
    $("#btnNewCustomer").off().on('click',function(){
        $("#modalCustomer").attr('customerId',''); //신규고객은 modal에서 id삭제
        $('.modal-body form')[0].reset(); //전체 form 리셋
        $("#modalCustomer").modal({backdrop:'static',keyboard:false});
        $("#btnDelCustomer").hide();
    });
    $("#btnSaveCustomer").off().on('click',function(){
       var check=fnValidCheckCustomer();
       if(check){
            var customer={
                name: $("#inputCustomerName").val(),
                phone:$("#inputCustomerPhone").val(),
                address:$("#inputCustomerAddress").val(),
                vip:$("#inputCustomerClass").val(),
                point:$("#inputCustomerPoint").val(),
                memo:$("#inputCustomerMemo").val()
            }

            if($("#modalCustomer").attr('customerId')){
                customer['id']=$("#modalCustomer").attr('customerId');
                fnUpdateCustomer(customer);
            }else{
                fnSaveNewCustomer(customer);
            }
           
       }
    });
    $("#btnDelCustomer").off().on('click',function(){
        
        fnDeleteCustomer($("#modalCustomer").attr('customerId'));
        
    });
    $("#btnSearchCustomer").off().on('click',function(){
        var keyword=$("#inputSearchCustomer").val();
        if(!keyword){
            fnGetAllCustomerList();
        }else{
            fnSearchCustomer(keyword);
        }
    });

    
    $("#btnDelCustomer").off().on('click',function(){
        var res=confirm('삭제하시겠습니까?');
        if(res){
            fnDeleteCustomer($("#modalCustomer").attr('customerId'));
        }
    });
    //포인트 상세내역 닫기
    $("#btnCloseHistory").off().on('click',function(){
        $("#modalCustomerHistory").modal('hide');
    });

    //포인트내역 조회
    $("[id=btnCustomerHistory]").off().on('click',function(){
       var customerId=$(this).attr('customerid');
        fnGetCustomerHistory(customerId);
    });
}


function fnTableEventBind(){
    //header, footer를 제외, customerId를 포함한 row
    $("tr[customerId]").off().on('dblclick',function(){
        $("#btnDelCustomer").show();
        var id=$(this).attr('customerId');
        fnPopupModalCustomer(id);
    });
}


function fnGetCustomerHistory(customerId){
    $.ajax({ 
        url: "/api/sales",
        method: "GET",   
        dataType:"json",
        data:{
            keyword:customerId
        },    
        success:success,
        fail:fail
    });
    function success(data){
        $("#tbCustomerHistory").empty();
        var historyList=[];
        for(var i=0;i<data.length;++i){
            var history={};
            history.createdAt=moment(data[i].createdAt).format("YYYY-MM-DD / HH:mm");//로컬시간 적용 필요
            if(data[i].productInfo._id!=-1){
                history.product=data[i].productInfo.name;
            }else{
                history.product="없음"
            }
            if(data[i].pointUse!=0){
                history.point='-￦'+$.number(data[i].pointUse,0,',');
            }else{
                history.point="0";
            }
            historyList.push(history);
        }
        var renderData={
            historyList:historyList
        }
        var source=$("#tbCustomerHistory-template").html();
        var template=Handlebars.compile(source);
        var html=template(renderData);
        $("#tbCustomerHistory").html(html);
        $("#modalCustomerHistory").modal('show');
    }
    function fail(err){
    
    }
}
function fnDeleteCustomer(customerId){
    $.ajax({ 
        url: "/api/customer/"+customerId,
        method: "DELETE",   
        success:success,
        fail:fail
    });
    function success(data){
        alert('삭제되었습니다.');
        $("#modalCustomer").modal('hide');
        fnGetAllCustomerList();
        
    }
    function fail(err){
        console.log(err);
    }
}
function fnSearchCustomer(keyword){
    $.ajax({ 
        url: "/api/customer",
        method: "GET", 
        dataType:"json",
        data:{
            keyword:keyword
        },    
        success:success,
        fail:fail
    });
    function success(data){
        fnRenderCustomerList(data)
    }
    function fail(err){
        console.log(err);
    }
}
function fnPopupModalCustomer(customerId){
    $("#modalCustomer").attr('customerId',customerId);
    $.ajax({ 
        url: "/api/customer/"+customerId,
        method: "GET", 
        dataType: "json",
        success:success,
        fail:fail
    });
    function success(data){
        //console.log(data);
        $("#inputCustomerName").val(data.name);
        $("#inputCustomerPhone").val(data.phone);
        $("#inputCustomerAddress").val(data.address);
        $("#inputCustomerClass").val(data.vip);
        $("#inputCustomerPoint").val(data.point);
        $("#inputCustomerMemo").val(data.memo);
        
        $("#modalCustomer").modal({backdrop:'static',keyboard:false});
    }
    function fail(err){
        console.log(err);
    }

    


}
//저장후 렌더링함수 호출
function fnSaveNewCustomer(customer){
    //POST
    $.ajax({ 
        url: "/api/customer",
        method: "POST",
        data:customer,
        dataType: "json",
        success:success,
        fail:fail
    });
    function success(data){
        $("#modalCustomer").modal('hide');
        fnGetAllCustomerList();
    }
    function fail(err){
        console.log(err);
    }
    
}
function fnValidCheckCustomer(){
    var name=$("#inputCustomerName").val();
    var phone=$("#inputCustomerPhone").val(); //입력양식만 검사, POST호출시 중복검사
    //focus
    var address=$("#inputCustomerAddress").val();
    var vip=$("#inputCustomerClass").val();
    var point=$("#inputCustomerPoint").val();
    var memo=$("#inputCustomerMemo").val();
    
    //check 로직 추가
    return true;
}

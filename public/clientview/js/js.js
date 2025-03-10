function OpenAddNew(controller, action, div) {
    $("#divprocessing").fadeIn();
    var formData = new FormData();
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#" + div).html(data);
            $("#divprocessing").fadeOut();
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function LoadData(controller, action, div) {
    var formData = new FormData();
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#" + div).html(data);
        },
        error: function (data) {
        }
    });
}
function LoadDataParam(controller, action, div,pram) {
    var formData = new FormData();
    formData.append("param", pram);
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#" + div).html(data);
        },
        error: function (data) {
        }
    });
}
function LoadNumItem() {
    var formData = new FormData();
    $.ajax({
        type: 'POST',
        url: "/Carts/NumItem",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#numitemincart").html(data);
            $("#numitemincart1").html(data);
        },
        error: function (data) {
        }
    });
}
function Setpermission(acc, codeper,check) {
    var formData = new FormData();
    var chkActive = $(check).is(':checked');
    formData.append("acc", acc);
    formData.append("per", codeper);
    formData.append("chk", chkActive);
    $.ajax({
        type: 'POST',
        url: "/Permissions/Create",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.trim() == "SUCCESS") {

            }
            else ShowAlert(data);
        },
        error: function (data) {
            ShowAlert("Lỗi kết nối");
        }
    });
}
function DangNhap() {
    var formData = new FormData();
    var acc = $("#txttaikhoan").val();
    var pass = $("#txtmatkhau").val();
    formData.append("acc", acc);
    formData.append("pass", pass);
    $.ajax({
        type: 'POST',
        url: "/Users/Login",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.trim() == "SUCCESS") {
                window.location.href = "/cms";
            }
            else ShowAlert(data);
        },
        error: function (data) {
            ShowAlert("Lỗi kết nối");
        }
    });
}
function Logout() {
    var formData = new FormData();
    $.ajax({
        type: 'POST',
        url: "/Users/Logout",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.trim() == "SUCCESS") {
                window.location.href = "/dang-nhap";
            }
            else ShowAlert(data);
        },
        error: function (data) {
            ShowAlert("Lỗi kết nối");
        }
    });
}
function ShowAlert(ct) {
    $("#contentalertbox").html(ct);
    $('#outalertbox').fadeIn();
    var contentalertbox = $("#contentalertbox").height();
    var heiwindow = $(window).height();
    heiwindow = heiwindow - 200;
    if (contentalertbox > heiwindow) $("#contentalertbox").css("overflow-y", "scroll");
    else $("#contentalertbox").css("overflow-y", "none");
    $("#alertbuttoncancel").attr("onclick", "$('#outalertbox').fadeOut();");
}
function SelectImage(input, divadd) {
    var files = $(input).prop("files");
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
            document.getElementById(divadd).src = fr.result;
        }
        fr.readAsDataURL(files[0]);
    }
}
function SaveRecord(controller, action, functionreturn, stringalert) {
    $("#divprocessing").fadeIn();
    var formData = new FormData();
    var inputs = $("#formdata").find("input");
    var selects = $("#formdata").find("select");
    var textareas = $("#formdata").find("textarea");
    for (var i = 0; i < inputs.length; i++) {
        var type = $(inputs[i]).attr("type");
        var id = $(inputs[i]).attr("id");
        if (type == 'checkbox') {
            var chkActive = $(inputs[i]).is(':checked');
            formData.append(id, chkActive);
        }
        else
            if (type == 'file') {
                for (var abc = 0; abc < inputs[i].files.length; abc++) {
                    fen = inputs[i].files[abc];
                    formData.append(id + abc, inputs[i].files[abc]);
                }
            }
            else {
                var vl = $(inputs[i]).val();
                formData.append(id, vl);
            }
    }
    for (var i = 0; i < selects.length; i++) {
        var id = $(selects[i]).attr("id");
        var vl = $(selects[i]).val();
        formData.append(id, vl);
    }
    for (var i = 0; i < textareas.length; i++) {
        var id = $(textareas[i]).attr("id");
        var vl = $(textareas[i]).val();
        var title = $(textareas[i]).attr("title");
        if (typeof title !== typeof undefined && title !== false) {
            if (title.trim() == "ckeditor")
                vl = CKEDITOR.instances[id].getData();
        }
        formData.append(id, vl);
    }
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divprocessing").fadeOut();
            if (data.trim() == "SUCCESS") {
                ShowAlertLink(stringalert, functionreturn);
            }
            else {
                ShowAlert(data);
            }
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function SaveCTKM(controller, action, functionreturn, stringalert) {
    $("#divprocessing").fadeIn();
    var formData = new FormData();
    var inputs = $("#formdata").find("input");
    var selects = $("#formdata").find("select");
    var textareas = $("#formdata").find("textarea");
    for (var i = 0; i < inputs.length; i++) {
        var type = $(inputs[i]).attr("type");
        var id = $(inputs[i]).attr("id");
        if (type == 'checkbox') {
            var chkActive = $(inputs[i]).is(':checked');
            formData.append(id, chkActive);
        }
        else
            if (type == 'file') {
                for (var abc = 0; abc < inputs[i].files.length; abc++) {
                    fen = inputs[i].files[abc];
                    formData.append(id + abc, inputs[i].files[abc]);
                }
            }
            else {
                var vl = $(inputs[i]).val();
                formData.append(id, vl);
            }
    }
    for (var i = 0; i < selects.length; i++) {
        var id = $(selects[i]).attr("id");
        var vl = $(selects[i]).val();
        formData.append(id, vl);
    }
    for (var i = 0; i < textareas.length; i++) {
        var id = $(textareas[i]).attr("id");
        var vl = $(textareas[i]).val();
        var title = $(textareas[i]).attr("title");
        if (typeof title !== typeof undefined && title !== false) {
            if (title.trim() == "ckeditor")
                vl = CKEDITOR.instances[id].getData();
        }
        formData.append(id, vl);
    }
    var lines = $("#tbllinekm tr");
    for (var i = 1; i < lines.length; i++) {
        var tdlines = $(lines[i]).find("td");
        if (tdlines.length >= 4) {
            var vlitem = $(tdlines[0]).html();
            var vlitemname = $(tdlines[1]).html();
            var vlpricee = $(tdlines[2]).html();
            var vluudai = $(tdlines[3]).html();
            formData.append("vlitem_" + i, vlitem);
            formData.append("vlitemname_" + i, vlitemname);
            formData.append("vlpricee_" + i, vlpricee);
            formData.append("vluudai_" + i, vluudai);
        }
    }
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divprocessing").fadeOut();
            if (data.trim() == "SUCCESS") {
                ShowAlertLink(stringalert, functionreturn);
            }
            else {
                ShowAlert(data);
            }
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function OpenFunctionPr(controller, action,div, pr) {
    $("#divprocessing").fadeIn();
    var formData = new FormData();
    formData.append("pr", pr);
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#" + div).html(data);
            $("#divprocessing").fadeOut();
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function ShowAlertLink(ct, functioname) {
    $("#contentalertbox").html(ct);
    $('#outalertbox').fadeIn();
    var contentalertbox = $("#contentalertbox").height();
    var heiwindow = $(window).height();
    heiwindow = heiwindow - 200;
    if (contentalertbox > heiwindow) $("#contentalertbox").css("overflow-y", "scroll");
    else $("#contentalertbox").css("overflow-y", "none");
    $("#alertbuttoncancel").attr("onclick", functioname);
}
function RemoveFunction(controller, action, title, param) {
    var functionRemoveRecord = "RemoveRecord('" + controller + "','" + action + "','" + param + "');";
    ShowConfirm(title, functionRemoveRecord);
}
function RemoveRecord(controller, action, param) {
    $("#divprocessing").fadeIn();
    var formData = new FormData();
    formData.append('param', param);
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            if (data.trim() == "SUCCESS") {
                ShowAlertLink('Đã xóa bản ghi.', "After" + action + "('" + param + "')");
            }
            else {
                ShowAlert(data);
            }
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function ShowConfirm(ct, functioncf) {
    $("#contentconfirmbox").html(ct);
    $("#confirmbuttonyes").attr("onclick", functioncf);
    $("#outconfirmbox").fadeIn();
    var contentalertbox = $("#contentconfirmbox").height();
    var heiwindow = $(window).height();
    heiwindow = heiwindow - 200;
    if (contentalertbox > heiwindow) $("#contentconfirmbox").css("overflow-y", "scroll");
    else $("#contentconfirmbox").css("overflow-y", "none");
}
function AfterDelete(id) { 
    $('#outalertbox').fadeOut();
    $("#idrowrecordtu_" + id).remove();
}
function bodauTiengViet(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/ /g, "-");
    str = str.replace(/[.*+?^${}()\/`~><%!'"#,.;|[\]\\]/g, '-');

    return str.trim();
}
function Search() {
    var textsearch = $("#txtSearch").val();
    if (textsearch.trim() != '') {
        textsearch = bodauTiengViet(textsearch);
        window.location.href = "/tim-kiem/" + textsearch;
    }
}
function Search1() {
    var textsearch = $("#txtSearch1").val();
    if (textsearch.trim() != '') {
        textsearch = bodauTiengViet(textsearch);
        window.location.href = "/tim-kiem/" + textsearch;
    }
}
function EnterSearch(e) {
    if (e.which == 13) {
        Search();
    }
}
function EnterSearch1(e) {
    if (e.which == 13) {
        Search1();
    }
}
function LoadSearch(controller, action, formid, divhow) {
    var formData = new FormData();
    var inputs = $("#" + formid).find("input");
    var selects = $("#" + formid).find("select");
    var textareas = $("#" + formid).find("textarea");
    for (var i = 0; i < inputs.length; i++) {
        var type = $(inputs[i]).attr("type");
        var id = $(inputs[i]).attr("id");
        if (type == 'checkbox') {
            var chkActive = $(inputs[i]).is(':checked');
            formData.append(id, chkActive);
        }
        else
            if (type == 'file') {
                for (var abc = 0; abc < inputs[i].files.length; abc++) {
                    fen = inputs[i].files[abc];
                    formData.append(id + abc, inputs[i].files[abc]);
                }
            }
            else {
                var vl = $(inputs[i]).val();
                formData.append(id, vl);
            }
    }
    for (var i = 0; i < selects.length; i++) {
        var id = $(selects[i]).attr("id");
        var vl = $(selects[i]).val();
        formData.append(id, vl);
    }
    for (var i = 0; i < textareas.length; i++) {
        var id = $(textareas[i]).attr("id");
        var vl = $(textareas[i]).val();
        var title = $(textareas[i]).attr("title");
        if (typeof title !== typeof undefined && title !== false) {
            if (title.trim() == "ckeditor")
                vl = CKEDITOR.instances[id].getData();
        }
        formData.append(id, vl);
    }
    $.ajax({
        type: 'POST',
        url: "/" + controller + "/" + action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#" + divhow).html(data);
        },
        error: function (data) {
            //ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function ReplaceCurrencyF(ipcry) {
    var number = $("#" + ipcry).val();
    number = number.replace(/\./g, "");
    var number1 = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    $("#" + ipcry).val(number1);
}
function ReplaceCurrencyR(ipcry) {
    var number = ipcry.toString();
    number = number.replace(/\./g, "");
    var number1 = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return number1;
}
function ReplaceCurrencyKeyDown(ipcry, theEvent) {
    var key = theEvent.keyCode || theEvent.charCode;
    var key1 = String.fromCharCode(key);
    var regx = /^[0-9_-]$/
    if (key != 8 && key != 189) {
        if (!regx.test(key1)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }
}
function ReplaceCurrency(ipcry, theEvent) {
    var number = $(ipcry).val();
    number = number.replace(/\./g, "");
    if (number.length > 1) {
        if (number.substr(0, 1) == "0") {
            number = number.substr(1);
            $(ipcry).val(number);
            return;
        }
    }
    if (number.length > 3) {
        var number1 = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        $(ipcry).val(number1);
    }
}
function GiamSoLuong(div) {
    var vl = $("#" + div).html().trim();
    var ivl = parseInt(vl);
    if (ivl > 1)
        ivl--;
    $("#" + div).html(ivl);
}
function TangSoLuong(div) {
    var vl = $("#" + div).html().trim();
    var ivl = parseInt(vl);
    ivl++;
    $("#" + div).html(ivl);
}
function RemoveItemInCart(iditem) {
    var formData = new FormData();
    formData.append('item', iditem);
    $.ajax({
        type: 'POST',
        url: "/Carts/RemoveItemCart",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.trim() == "SUCCESS") {
                $("#triteamcart_" + iditem).remove();
            }
            else ShowAlert(data);
        },
        error: function (data) {
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function GiamSoLuongInCart(div) {
    var vl = $("#" + div).html().trim();
    var ivl = parseInt(vl);
    if (ivl > 1)
        ivl--;
    $("#" + div).html(ivl);
    var iditem = div.replace('divsoluongchon_', '');
    var formData = new FormData();
    formData.append('item', iditem);
    formData.append('quantity', ivl);
    $.ajax({
        type: 'POST',
        url: "/Carts/ChangeItemCart",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divtacvu").html(data);
        },
        error: function (data) {
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function TangSoLuongInCart(div) {
    var vl = $("#" + div).html().trim();
    var ivl = parseInt(vl);
    ivl++;
    $("#" + div).html(ivl);
    var iditem = div.replace('divsoluongchon_', '');
    var formData = new FormData();
    formData.append('item', iditem);
    formData.append('quantity', ivl);
    $.ajax({
        type: 'POST',
        url: "/Carts/ChangeItemCart",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divtacvu").html(data);
        },
        error: function (data) {
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function AddToCart(item) {
    $("#divprocessing").fadeIn();
    var divsoluongchon = $("#divsoluongchon").html();
    var formData = new FormData();
    formData.append('item', item);
    formData.append('sl', divsoluongchon);
    $.ajax({
        type: 'POST',
        url: "/Carts/AddToCart",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            if (data.trim() == "SUCCESS") {
                ShowAlert("Đã thêm vào giỏ hàng.");
                LoadNumItem();
            }
            else {
                ShowAlert(data);
            }
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function DatHang() {
    $("#divprocessing").fadeIn();
    var txthovaten = $("#txthovaten").val();
    var txtdiachi = $("#txtdiachi").val();
    var txtsodienthoai = $("#txtsodienthoai").val();
    var formData = new FormData();
    formData.append('txthovaten', txthovaten);
    formData.append('txtdiachi', txtdiachi);
    formData.append('txtsodienthoai', txtsodienthoai);
    $.ajax({
        type: 'POST',
        url: "/Carts/Create",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            if (data.trim() == "SUCCESS") {
                ShowAlertLink("Cảm ơn bạn đã tin tưởng Hoa Quả Xanh. Chúng tôi sẽ liên hệ bạn trong vòng 24h tới.", 'BackToHome()');
            }
            else {
                ShowAlert(data);
            }
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function BackToHome() {
    window.location.href = '/';
}
function MuaNgay(item) {
    $("#divprocessing").fadeIn();
    var divsoluongchon = $("#divsoluongchon").html();
    var formData = new FormData();
    formData.append('item', item);
    formData.append('sl', divsoluongchon);
    $.ajax({
        type: 'POST',
        url: "/Carts/AddToCart",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            if (data.trim() == "SUCCESS") {
                window.location.href="/gio-hang"
            }
            else {
                ShowAlert(data);
            }
        },
        error: function (data) {
            $("#divprocessing").fadeOut();
            $("#outconfirmbox").fadeOut();
            ShowAlert("Có lỗi về kết nối hoặc lỗi không mong muốn. Vui lòng báo quản lý của bạn");
        }
    });
}
function SelectTabItemDetails(tab,tabct) {
    //tablistdetailsitem
    var tabdetailsitem = $(".tablistdetailsitem .tabdetailsitem");
    for (var i = 0; i < tabdetailsitem.length; i++) {
        $(tabdetailsitem[i]).attr("class", "tabdetailsitem");
    }
    $(tab).attr("class", "tabdetailsitem tabselected");
    var contentdetailsitem = $(".ctlistdetailsitem .contentdetailsitem");
    for (var i = 0; i < contentdetailsitem.length; i++) {
        $(contentdetailsitem[i]).css("display", "none");
    }
    $("#" + tabct).css("display", "block");
}
/**
 * 
 * @authors hui
 * @date    2017-03-15
 * @version $Id$
 */
 $(function(){

    // 日历
    $(".birthday").datepicker();

    //search-btn 属性  
    $("#search-btn").button({
        // label:'搜索',   //改变value值 
        icons:{
            primary:'ui-icon-search',  //文字前面显示
        }
    });
    //question-btn 属性  
    $("#question-btn").button({
        icons:{
            primary:'ui-icon-lightbulb',  //文字前面显示
        }
    }).click(function(){
        if($.cookie('user')){
            $('#question').dialog('open');
        }else{
            $('#error-que').dialog('open');
            setTimeout(function(){
                $("#error-que").dialog('close');
                $("#login").dialog('open');
            },1000); //1秒后关闭
        }
    });

    //文本编辑器
    var editor;
    KindEditor.ready(function(K) {
        editor = K.create('textarea[name="content"]', {
            resizeType : 1,
            allowPreviewEmoticons : false,
        });
    });

    function save(){
        //取得HTML内容
        //同步数据后可以直接取得textarea的value
        editor.sync();
    }

    function conShow(){
        var arr = [];
            var summary = [];
            $(".bottom .up").hide();
            $.each($(".editor"), function(index, value){
                // console.log($(value).height());//获取原始高度
                arr[index] = $(value).html();  //将每一个原始高度存入数组
                // console.log(arr[index].substr(0,200));   //200个字符
                summary[index] = arr[index].substr(0, 100);
                //控制特殊字符段
                if (summary[index].substring(199,200) == '<') {
                    summary[index] = replacePos(summary[index], 200, '');
                }
                if (summary[index].substring(198,200) == '</') {
                    summary[index] = replacePos(summary[index], 200, '');
                    summary[index] = replacePos(summary[index], 199, '');
                }
                
                if (arr[index].length > 100) {
                    summary[index] += '...<span class="down">显示全部</span>';
                    $(value).html(summary[index]);
                }
                $('.bottom .up').hide();
            });

            $.each($('.editor'), function (index, value) {
                //显示
                $(this).on('click', '.down', function () {
                    $('.editor').eq(index).html(arr[index]);
                    $(this).hide();
                    $('.bottom .up').eq(index).show();
                });
            });

            $.each($('.bottom'), function (index, value) {
                //隐藏
                $(this).on('click', '.up', function () {
                    $('.editor').eq(index).html(summary[index]);
                    $(this).hide();
                    $('.editor .down').eq(index).show();
                });
            });

            $.each($('.bottom'), function (index, value) {
                //显示评论表单
                $(this).on('click','.comment',function(){
                    var comment_this = this;
                    //判断是否登录，登录后才可评论
                    if($.cookie('user')){
                        //判断当前comment-list是否已经有此表单
                        if(!$('.comment-list').eq(index).has('form').length){
                            //加载评论内容
                            $.ajax({
                                url:'../show_comment.php',
                                type:'POST',
                                data:{
                                    // user:$.cookie('user'),
                                    titleid:$(comment_this).attr('data-id')
                                },
                                beforeSend:function(jqXHR,settings){
                                    $('.comment-list').eq(index).append('<dl class="comment-load"><dd>正在加载评论</dd></dl>');
                                },
                                success:function(response,status){
                                    //隐藏加载条
                                    $('.comment-list').eq(index).find('.comment-load').hide();
                                    //显示评论
                                    console.log(response);
                                    var json_comment = $.parseJSON(response);

                                    var html_comment='';
                                    var count = 0;
                                    $.each(json_comment,function(index2, value){
                                        count = value.count;   //总共有多少页  处理每次点击到最后一页后，再次点击都是加载最后一页
                                        html_comment = '<dl class="comment-text"><dt>' + value.user + '</dt><dd>' + value.comment + '</dd><dd>' + value.date + '</dd></dl>';
                                        $('.comment-list').eq(index).append(html_comment);
                                    });

                                    //加载更多评论
                                    $('.comment-list').eq(index).append('<dl class="load-more"><dd><span>加载更多评论</span></dd></dl>');
                                    //加载更多评论点击事件
                                    var page =2;
                                    //如果页数只有一页，则自动隐藏加载更多
                                    if(page > count){
                                        // $('.comment-list').eq(index).find(".load-more").find("span").off('click');  //销毁掉或者隐藏元素
                                        $('.comment-list').eq(index).find(".load-more").button().hide();
                                    }
                                    $('.comment-list').eq(index).find(".load-more").button().on('click', function(){
                                        $('.comment-list').eq(index).find(".load-more").button('disable');  //点击一次后就禁用
                                        $.ajax({
                                            url: "../show_comment.php",
                                            type:"POST",
                                            data:{
                                                titleid:$(comment_this).attr("data-id"),
                                                page:page
                                            },
                                            beforeSend:function(jqXHR,settings ){
                                                $('.comment-list').eq(index).find(".load-more").html('<img src="../../static/images/more_load.gif" alt="" />');
                                            },
                                            success:function(response,status){
                                                var json_comment_more = $.parseJSON(response);

                                                var html_comment='';
                                                $.each(json_comment_more,function(index3, value){
                                                    html_comment_more = '<dl class="comment-text"><dt>' + value.user + '</dt><dd>' + value.comment + '</dd><dd>' + value.date + '</dd></dl>';
                                                    $('.comment-list').eq(index).find(".comment-text").last().after(html_comment_more);
                                                    console.log($('.comment-list').eq(index).find(".comment-text").last().val());
                                                });
                                                $('.comment-list').eq(index).find(".load-more").button('enable');  //加载成功后启用
                                                $('.comment-list').eq(index).find(".load-more").html('加载更多评论')
                                                page++;
                                                //如果页数大于count，则销毁掉click事件或者隐藏元素
                                                if(page > count){
                                                    // $('.comment-list').eq(index).find(".load-more").find("span").off('click');  //销毁掉或者隐藏元素
                                                    $('.comment-list').eq(index).find(".load-more").button().hide();
                                                }

                                            }
                                        })

                                    })
                                    //评论输入框动态添加
                                    $(".comment-list").eq(index).append('<form><dl class="comment-con"><dt><textarea name="comment"></textarea></dt><dd><input type="hidden" name="titleid" value="'+ $(comment_this).attr('data-id') +'" /><input type="hidden" '+ $.cookie('user') +'/><input class="send" type="button" value="发表" /></dd></dl></form>');
                                    //点击评论显示评论框并且提交回答
                                    $(".comment-list").eq(index).find('input[type=button]').button().click(function(){
                                        var _this = this;
                                        $('.comment-list').eq(index).find('form').ajaxSubmit({
                                            url:'../add_comment.php',
                                            type:'POST',
                                            data:{
                                                user:$.cookie('user'),
                                                beforeSubmit:function(formData,jqForm,options){     
                                                    //将发表后的button禁用
                                                    $(_this).button('disable');
                                                }
                                            },
                                            
                                            success:function(responseText,statusText){
                                                if(responseText){
                                                    //发表成功后释放button按钮
                                                    $(_this).button('enable');
                                                    $('#loading').css('background', 'url(img/success.gif) no-repeat 20px center').html('数据新增成功...');
                                                    setTimeout(function () {
                                                        var date = new Date();
                                                        $('#loading').dialog('close');
                                                            // //显示评论,即时全部评论内容上方显示
                                                            $('.comment-list').eq(index).prepend('<dl class="comment-text"><dt>' + $.cookie('user') + '</dt><dd>' + $('.comment-list').eq(index).find('textarea').val() + '</dd><dd>' +date.getFullYear() + '-' + (date.getMonth()+ 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' +date.getMinutes() + ':' + date.getSeconds() + '</dd></dl>');
                                                            
                                                            $('.comment-list').eq(index).find('form').resetForm();
                                                            $('#loading').css('background', 'url(img/loading.gif) no-repeat 20px center').html('数据交互中...');
                                                        }, 1000);
                                                }                
                                            }
                                        });
                                    }); 
                                }
                            })
                        } 

                        //评论点击显示隐藏
                        if($('.comment-list').eq(index).is(":hidden")){
                            $('.comment-list').eq(index).show();
                        }else{
                            $('.comment-list').eq(index).hide();
                        }  

                    }else{
                        $('#error-que').dialog('open');
                        setTimeout(function(){
                            $("#error-que").dialog('close');
                            $("#login").dialog('open');
                        },1000); //1秒后关闭
                    }
                });
            });
    }

    //提问 ， 显示回答条数
    $.ajax({
        url : '../show_content.php',
        success : function (response, status, xhr) {
            var json = $.parseJSON(response);
            var html = '';
            //提问显示
            $.each(json,function(index, value){
                html += '<h4><span class="username">' + value.user + '</span>发表于 ' + value.date + '</h4><h3>' 
                + value.title + '</h3><p class="editor">' + value.content 
                + '</p><div class="bottom"><span class="comment" data-id="'+ value.id +'">' + value.count + '&nbsp;条评论</span><span class="up">收起</span></div><div class="comment-list"></div>';
            });
            $(".que-content").append(html);

            conShow();
        }
    })

    //提问
    $('#question').dialog({
        title:'提问',
        autoOpen:false,
        modal:true,
        resizable:false,
        buttons:{
            '发布':function(){
                save(),  //
                $(this).ajaxSubmit({
                    url:'../add_content.php',
                    type:'POST',
                    data:{
                        user:$.cookie('user'),
                        content:$("#que").val(),  
                        beforeSubmit:function(formData,jqForm,options){     
                            //提交数据后显示loading
                            $("#loading").dialog('open');
                            //将提交后的button禁用
                            $("#question").dialog('widget').find('button').eq(1).button  ('disable');
                        },
                        success:function(responseText,statusText){
                            // if(responseText){
                                //提交成功后释放button按钮
                                $("#question").dialog('widget').find('button').eq(1).button('enable');
                                //提交成功后设置loading成功样式
                                $("#loading").css('background','url(../../static/images/success.gif) no-repeat 20px center').html('数据新增成功!');
                                // $.cookie('user',$('.user').val());
                                //提交成功后隐藏loading，表单
                                setTimeout(function(){
                                    save();
                                    $("#loading").dialog('close');
                                    $("#loading").css('background','url(../../static/images/loading.gif) no-repeat 20px center').html('数据交互中...');
                                    $("#question").dialog('close');
                                    //清空表单数据
                                    $("#question").resetForm();
                                    //清空编辑器内容
                                    KindEditor.instances[0].html("请输入问题描述"); //0表示第一个KindEditor编辑器对象
                                },1000);
                            // }
                        }
                    }
                });
            }
        },
        width:'auto',
        height:390     
    });


    //error
    $('#error-que').dialog({
        autoOpen:false,
        modal:true,
        closeOnEscape:false,   //取消Esc键退出功能
        resizable:false,  //不能移动
        draggable:false,  //不能放大缩小
        width:180,
        height:50,  //加载loading时显示会增加30px,顾再此减去
    }).parent().find('.ui-widget-header').hide();

    //打开注册表单
    $("#reg_a").click(function(){
        $("#reg").dialog('open');
    })

    //loading
    $('#loading').dialog({
        autoOpen:false,
        modal:true,
        closeOnEscape:false,   //取消Esc键退出功能
        resizable:false,  //不能移动
        draggable:false,  //不能放大缩小
        width:180,
        height:50,  //加载loading时显示会增加30px,顾再此减去
    }).parent().find('.ui-widget-header').hide();

    $('#member, #loginout').hide();
    //判断是否是已经保存的cookie
    if($.cookie('user')){
        //显示用户名和退出选择
        $("#member, #loginout").show();
        //隐藏注册与登录按钮
        $('#reg_a,#login_a').hide();
        //获取显示用户名
        $("#member").html($.cookie('user'));
    }else{
        //显示注册与登录按钮
        $('#reg_a,#login_a').show();
        //隐藏用户名与退出选项
        $('#member, #loginout').hide();
    }

    //退出操作
    $('#loginout').click(function() {
       //删除cookie
       $.removeCookie('user');
       window.location.href='/check/ajax-search/search/index.html';  //跳转到首页
   });

    //提交注册表单
    $('#reg').dialog({
        title:'慧知客注册',
        autoOpen:false,
        modal:true,
        resizable:false,
        draggable:false,
        closeOnEscape:false,
        buttons:{
            '提交':function(){
                $(this).submit();
            }
        },
        width:340,
        height:340      
    }).buttonset().validate({
        submitHandler:function(form){
            $(form).ajaxSubmit({
                url:'../add.php',
                type:'POST',
                beforeSubmit:function(formData,jqForm,options){     
                        //提交数据后显示loading
                        $("#loading").dialog('open');
                        //将提交后的button禁用
                        $("#reg").dialog('widget').find('button').eq(1).button('disable');
                    },
                    success:function(responseText,statusText)    {
                        //提交成功后释放button按钮
                        $("#reg").dialog('widget').find('button').eq(1).button('enable');
                         //提交成功后设置loading成功样式
                         $("#loading").css('background','url(../../static/images/success.gif) no-repeat 20px center').html('数据新增成功!');
                         $.cookie('user',$('.user').val());
                         //提交成功后隐藏loading，表单
                         setTimeout(function(){
                            $("#loading").dialog('close');
                            $("#loading").css('background','url(../../static/images/loading.gif) no-repeat 20px center').html('数据交互中.s..');
                            $("#reg").dialog('close');
                            //清空表单数据
                            $("#reg").resetForm();
                            //去掉成功提示
                            $("#reg span.star").html('*').removeClass('succ');

                            //显示用户名和退出选择
                            $("#member, #loginout").show();
                            $('#reg_a,#login_a').hide();
                            $("#member").html($.cookie('user'));
                        },1000);

                     }
                 })
        },
        showErrors:function(errorMap, errorList){
            var errors = this.numberOfInvalids();
            if(errors > 0){
                $('#reg').dialog('option','height',errors*20 + 340);
            }else{
                $('#reg').dialog('option','height',340);
            }
            this.defaultShowErrors();
        },
            //高亮显示有错误--边框
            highlight:function(element,errorClass){
               $(element).css("border","1px solid red");
               $(element).parent().find('span').html('&nbsp;').removeClass('succ');
           },
            //成功的元素移除错误高亮
            unhighlight:function(element,errorClass){
                $(element).css("border","1px solid #ddd");
                $(element).parent().find('span').html('&nbsp;').addClass('succ');
            },
            errorLabelContainer:'ol.reg-error',
            wrapper:'li',
            rules:{
                user:{
                    required:true,
                    minlength:2,
                    remote:{
                        url:'../is_user.php',
                        type:'POST'

                    }
                },
                password:{
                    required:true,   
                    minlength:6,   
                },
                email:{
                    required:true,
                    email:true
                }
            },
            messages:{
                user:{
                    required:"账号不得为空！",
                    minlength:jQuery.format("账号不得小于{0}位"),
                    remote:'账号被占用'
                },
                password:{
                    required:'密码不得为空！',
                    minlength:jQuery.format('密码不得小于{0}位'),
                },
                email:{
                    required:"邮箱不得为空！",
                    minlength:jQuery.format("请输入正确的邮箱地址！")
                }   
            }
        });


    $("#login_a").click(function(){
        $("#login").dialog('open');
    })

    //提交登录表单
    $('#login').dialog({
        autoOpen:false,
        modal:true,
        resizable:false,
        draggable:false,
        closeOnEscape:false,
        title:'慧知客登录',
        buttons:{
            '登录':function(){
                $(this).submit();
            }
        },
        width:340,
        height:260      
    }).buttonset().validate({
        submitHandler:function(form){
            $(form).ajaxSubmit({
                url:'../login.php',
                type:'POST',
                beforeSubmit:function(formData,jqForm,options){     
                        //提交数据后显示loading
                        $("#loading").dialog('open');
                        //将提交后的button禁用
                        $("#login").dialog('widget').find('button').eq(1).button('disable');
                    },
                    success:function(responseText,statusText)    {
                        //提交成功后释放button按钮
                        $("#login").dialog('widget').find('button').eq(1).button('enable');
                         //提交成功后设置loading成功样式
                         $("#loading").css('background','url(../../static/images/success.gif) no-repeat 20px center').html('登录成功!');
                         $.cookie('user',$('.log-user').val());

                         //判断user有效期
                         if($("#expires").is(":checked")){
                            $.cookie('user',$('.log-user').val(),{
                                expires:7
                            })
                        }else{
                            $.cookie('user',$('.log-user').val());
                        }
                         //提交成功后隐藏loading，表单
                         setTimeout(function(){
                            $("#loading").dialog('close');
                            $("#loading").css('background','url(../../static/images/loading.gif) no-repeat 20px center').html('数据交互中...');
                            $("#login").dialog('close');
                            //清空表单数据
                            $("#login").resetForm();
                            //去掉成功提示
                            $("#login span.star").html('*').removeClass('succ');

                            //显示用户名和退出选择
                            $("#member, #loginout").show();
                            $('#reg_a,#login_a').hide();
                            $("#member").html($.cookie('user'));
                        },1000);

                     }
                 })
        },
        showErrors:function(errorMap, errorList){
            var errors = this.numberOfInvalids();
            if(errors > 0){
                $('#login').dialog('option','height',errors*20 + 240);
            }else{
                $('#login').dialog('option','height',240);
            }
            this.defaultShowErrors();
        },
            //高亮显示有错误--边框
            highlight:function(element,errorClass){
               $(element).css("border","1px solid red");
               $(element).parent().find('span').html('&nbsp;').removeClass('succ');
           },
            //成功的元素移除错误高亮
            unhighlight:function(element,errorClass){
                $(element).css("border","1px solid #ddd");
                $(element).parent().find('span').html('&nbsp;').addClass('succ');
            },
            errorLabelContainer:'ol.login-error',
            wrapper:'li',
            rules:{
                loguser:{
                    required:true,
                    minlength:2
                },
                logpassword:{
                    required:true,   
                    minlength:6,   
                    remote:{
                        url:'../login.php',
                        type:'POST',
                        data:{
                            loguser:function(){
                                return $(".log-user").val();
                            }
                        }
                    }
                }
            },
            messages:{
                loguser:{
                    required:"账号不得为空！",
                    minlength:jQuery.format("账号不得小于{0}位")
                },
                logpassword:{
                    required:'密码不得为空！',
                    minlength:jQuery.format('密码不得小于{0}位'),
                    remote:'账号或密码不正确'
                }  
            }
        });
    
    //自动补全
    $(".email").autocomplete({
        delay : 0,
        autoFocus : true,  //首选
        source:function(request, response){
            var hosts = ['qq.com','163.com','sina.com.cn','gmail.com'],
                term = request.term,   //获取用户输入的内容
                name = term,  //邮箱的用户名
                host = '',    //域名
                ix = term.indexOf("@"),  //@的位置
                result = [];    //最终呈现的邮箱列表

            result.push(term);  //没有写入数据源的也能显示

            //当有@的时候，重新分别用户名和域名
            if(ix > -1){   //是则有@符号
                name = term.slice(0,ix);
                host = term.slice(ix+1);
            }
            if(name){
                var findedHosts = (host ? $.grep(hosts,function(value, index){
                    return value.indexOf(host) > -1;
                }):hosts),findedResult = $.map(findedHosts,function(value,index){
                    return name + '@' + value;
                });

                result = result.concat(findedResult);  //没有写入数据源的也能显示


            }
            response(result);
        }
    });

    //tab
    $("#tabs").tabs();

    //accordion
    $("#accordion").accordion({
        icons:{
            "header":"ui-icon-plus",  
            "activeHeader":"ui-icon-minus"  //切换后
        }
    });

    //字符串分割隐藏
    function replacePos(strObj, pos, replaceText) {
        return strObj.substr(0, pos-1) + replaceText + strObj.substring(pos, strObj.length);
    }

    //查询  根据title   
    $.ajax({
        url:"../show_content2.php",
        type:'POST',
        success:function(response,status){ 
            var content = response; //取到title数组 
            console.log(typeof content)
            var hosts =content.split(",");  //转换为数组
            console.log(hosts);

            //自动补全
            $(".search").autocomplete({  
                source:hosts,                
                delay : 0,
                autoFocus : true  //首选
            });

            $("#search-btn").click(function(){
                //查询时候先清空content值
                $(".que-content").html("");

                //取到input中输入的关键字
                var $text = $(".header-search .search").val();           
                var strs= new Array(); //定义空数组                               
                var titles = content.split(","); //字符分割 

                //判断是否匹配 
                for(var i = 0 ; i < titles.length; i++){
                    if(titles[i] === $text){
                        console.log(titles[i]);
                        var checkTitle = titles[i];
                        console.log(typeof checkTitle);
                        $.ajax({
                            url:"../show.php?title="+checkTitle,
                            type:'GET',
                            success:function(response,status){
                                console.log(checkTitle);
                                var json = $.parseJSON(response);
                                var html = '';
                                //提问显示
                                $.each(json,function(index, value){
                                    html = '<h4><span class="username">' + value.user + '</span>发表于 ' + value.date + '</h4><h3>' 
                                    + value.title + '</h3><p class="editor">' + value.content 
                                    + '</p><div class="bottom"><span class="comment" data-id="'+ value.id +'">' + value.count + '&nbsp;条评论</span><span class="up">收起</span></div><div class="comment-list"></div>';
                                });

                                $(".que-content").append(html);
                                conShow();
                            }
                        })
                    }
                } 
            })
             
        }

    })     

})

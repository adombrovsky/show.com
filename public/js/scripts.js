$(document).ready(function(){
    var body = $('body');
    body.on('submit', 'form.ajax', function(){
        var t = $(this);
        var data = t.serializeArray();
        var action = t.attr('action');
        var method = t.attr('method');
        $.ajax({
            type: method,
            url: action,
            data:data,
            dataType: 'JSON',
            success:function(json)
            {
                if (!json.success)
                {
                    return false;
                }
                switch (json.action)
                {
                    case 'reload':
                        location.reload();
                        break;
                    case 'redirect':
                        location.href = json.href;
                        break;
                    case 'popup':
                        console.log('i must implement popup function');
                        break;
                    default:
                        break;
                }
            }
        });
        return false;
    });

    $(document).ajaxStart(function(event, jqxhr, settings) {
        var el = $("#loader");
        if (el.length)
        {
            el.fadeIn('fast');
        }
    });

    $(document).ajaxComplete(function(event, jqxhr, settings) {
        var el = $("#loader");
        if (el.length)
        {
            el.fadeOut('fast');
        }
    });

    body.on('click', 'a.ajax, button.ajax', function(e){
        e.preventDefault();
        var t = $(this);
        if (t.hasClass('disabled')) return;

        $.ajax({
            type:'GET',
            url: t.attr('href'),
            dataType:'json',
            success:function(json)
            {
                if (json.success)
                {
                    if (json.seasons)
                    {
                        $("#seasons_list").html(json.seasons);
                    }
                    else if (json.episodeAdd)
                    {
                        t.fadeOut('fast',function(){t.removeClass('btn-primary ajax').removeAttr('href').addClass('btn-success disabled').text('Уже посмотрел')}).fadeIn();
                    }
                }
            }
        })
    });

    body.on('click','.accordion-toggle',function(e){
        e.preventDefault();
        var t = $(this);
        var parent = t.closest('.accordion-group');
        var collapse = parent.find('.collapse');
        if (collapse.hasClass('in'))
        {
            collapse.collapse('hide');
            return;
        }
        var wrapper = parent.find('.accordion-inner');
        if (wrapper.html() === '')
        {
            $.ajax({
                type:'GET',
                url: t.data('href'),
                dataType:'json',
                success:function(json)
                {
                    if (json.success)
                    {
                        wrapper.html(json.season);
                        collapse.collapse('show');
                    }
                }
            });
        }
        else
        {
            collapse.collapse('show');
        }
    });

    $(".tooltip-info.tr").tooltip({placement:'right'});
});
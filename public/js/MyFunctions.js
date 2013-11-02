var MyFunctions = function()
{
    this.isGuest = $("input#isGuest").val() == 'true';
};

MyFunctions.prototype.setNotificationCount = function()
{
    if (!this.isGuest)
    {
        $.ajax({
            type: 'POST',
            url:'/notification/count/',
            dataType:'json',
            success:function(json)
            {
                if (json.success)
                {
                    $("#notification_count").find('.badge').text(json.n_count).fadeIn();
                }
            }
        });
    }
};
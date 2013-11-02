var MyModal = function(options)
{
    if (!options || !options.body)
    {
        throw  new Error('you must pass option to MyModal plugin');
    }
    this.modal = options.modal;
    this.setBody(options.body);
    this.setTitle(options.title);
    this.open();
};


MyModal.prototype.setBody = function(text)
{
    this.modal.find('.modal-body').html(text);
};


MyModal.prototype.setTitle = function(text)
{
    this.modal.find("#modal-title").html(text);
};

MyModal.prototype.open = function()
{
    this.modal.modal('show');
};

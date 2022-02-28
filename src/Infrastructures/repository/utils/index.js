const mapThreadToModel = ({ 
    id,
    title,
    body,
    date,
    username,
}) => ({
    id,
    title,
    body,
    date,
    username,
});

const mapCommentsToModel = ({ 
    id,
    username,
    date,
    content,
    is_delete,
}) => ({
    id,
    username,
    date,
    content,
    is_delete,
});

const mapRepliesToModel = ({
    id,
    username,
    date,
    content,
    is_delete,
}) => ({
    id,
    username,
    date,
    content,
    is_delete,
});

module.exports = { mapThreadToModel,mapCommentsToModel,mapRepliesToModel };
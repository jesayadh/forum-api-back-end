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
}) => ({
    id,
    username,
    date,
    content,
});

module.exports = { mapThreadToModel,mapCommentsToModel };

module.exports = {
    port: 6161,
    redis_url: 'redis://root:UYdjD93@10.252.77.207:6379',
    queue_channel: {
        up_oss_image: "up_oss_image"
    },
    aly : {
        user: {
            tbx_platform: {
                accessKeyId: "yp1cx9EITCWhsF9S",
                secretAccessKey: "azNJFmwdMcPRVdke5noaGUp3gQlAMZ"
            } 
        },
        oss : {
            endpoint : 'http://oss-cn-hongkong-internal.aliyuncs.com', 
            bucket: {
                image: 'tbx-image-1'
            }
        }
        
    }
};


module.exports = {
    port: 6161,
    redis_url: 'redis://root:UYdjD93@127.0.0.1:6379',
    queue_channel: {
        up_oss_image: "up_oss_image",
        up_oss_video: "up_oss_video"
    },
    aly : {
        user: {
            tbx_platform: {
                accessKeyId: "yp1cx9EITCWhsF9S",
                secretAccessKey: "azNJFmwdMcPRVdke5noaGUp3gQlAMZ"
            } 
        },
        oss : {
            endpoint : 'http://oss-cn-beijing.aliyuncs.com',
            bucket: {
                image: 'test-tbx-image-1',
                video: 'test-tbx-video-1'
            }
        }
        
    }
};

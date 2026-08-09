START TRANSACTION;

SET @site_id = (SELECT `id` FROM `sites` ORDER BY `id` LIMIT 1);

INSERT INTO `site_translations`
  (`site_id`, `language_code`, `name`, `seo_title`, `seo_description`)
VALUES
  (@site_id, 'vi', 'Tiệm Tiện Lợi Mỹ Trân', 'Tiệm Tiện Lợi Mỹ Trân',
    'Đặt hàng trực tuyến tại Tiệm Tiện Lợi Mỹ Trân'),
  (@site_id, 'en', 'My Tran Convenience Store', 'My Tran Convenience Store',
    'Order online from My Tran Convenience Store'),
  (@site_id, 'zh-Hans', '美珍便利店', '美珍便利店',
    '美珍便利店在线订购'),
  (@site_id, 'zh-Hant', '美珍便利店', '美珍便利店',
    '美珍便利店線上訂購')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `seo_title` = VALUES(`seo_title`),
  `seo_description` = VALUES(`seo_description`);

COMMIT;

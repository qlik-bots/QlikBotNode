/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for sensebot
CREATE DATABASE IF NOT EXISTS `sensebot` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `sensebot`;

-- Dumping structure for table sensebot.channel
CREATE TABLE IF NOT EXISTS `channel` (
  `channel_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`channel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Dumping data for table sensebot.channel: ~6 rows (approximately)
/*!40000 ALTER TABLE `channel` DISABLE KEYS */;
INSERT INTO `channel` (`channel_id`, `title`) VALUES
	(1, 'skype'),
	(2, 'msteams'),
	(3, 'cortana'),
	(4, 'slack'),
	(5, 'webchat'),
	(6, 'telegram');
/*!40000 ALTER TABLE `channel` ENABLE KEYS */;

-- Dumping structure for table sensebot.user
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_uid` varchar(150) DEFAULT NULL COMMENT 'The unique Id as it comes from the channel',
  `user_name` varchar(50) DEFAULT NULL,
  `channel_id` int(11) DEFAULT '1',
  `user_data` tinytext,
  PRIMARY KEY (`user_id`),
  KEY `FK_user_channel` (`channel_id`),
  KEY `uuid` (`user_uid`),
  CONSTRAINT `FK_user_channel` FOREIGN KEY (`channel_id`) REFERENCES `channel` (`channel_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

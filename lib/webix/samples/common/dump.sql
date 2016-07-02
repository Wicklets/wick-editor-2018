--
-- Database: 'webixdocs'
--

-- --------------------------------------------------------

--
-- Table structure for table 'films'
--
DROP TABLE IF EXISTS films;
CREATE TABLE IF NOT EXISTS films (
  id int(11) NOT NULL AUTO_INCREMENT,
  title varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `year` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  votes int(11) DEFAULT NULL,
  rating varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  rank int(11) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=7 ;

--
-- Dumping data for table 'films'
--

INSERT INTO films (id, title, year, votes, rating, rank) VALUES(1, 'The Shaushenk Redemption ', '1998', 194865, '7.5', 1);
INSERT INTO films (id, title, year, votes, rating, rank) VALUES(2, 'The Godfather', '1975', 511495, '9.2', 2);
INSERT INTO films (id, title, year, votes, rating, rank) VALUES(3, 'The Godfather: Part II', '1974', 319352, '9.0', 3);
INSERT INTO films (id, title, year, votes, rating, rank) VALUES(4, 'The Good, the Bad and the Ugly', '1966', 213030, '8.9', 4);
INSERT INTO films (id, title, year, votes, rating, rank) VALUES(5, 'My Fair Lady', '1994', 533848, '9.1', 5);
INSERT INTO films (id, title, year, votes, rating, rank) VALUES(6, '12 Angry Men', '1957', 164558, '8.9', 6);

-- --------------------------------------------------------

--
-- Table structure for table 'films_tree'
--
DROP TABLE IF EXISTS films_tree;
CREATE TABLE IF NOT EXISTS films_tree (
  id int(11) NOT NULL AUTO_INCREMENT,
  title varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `open` int(11) DEFAULT '1',
  parent int(11) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=14 ;

--
-- Dumping data for table 'films_tree'
--
DROP TABLE IF EXISTS packages_plain;
INSERT INTO films_tree (id, title, open, parent) VALUES(1, 'Films data', 1, 0);
INSERT INTO films_tree (id, title, open, parent) VALUES(2, 'The Shawshank Redemption', 1, 1);
INSERT INTO films_tree (id, title, open, parent) VALUES(3, 'Part 1', 1, 2);
INSERT INTO films_tree (id, title, open, parent) VALUES(4, 'Part 2', 1, 2);
INSERT INTO films_tree (id, title, open, parent) VALUES(5, 'Page 1', 0, 4);
INSERT INTO films_tree (id, title, open, parent) VALUES(6, 'Page 2', 0, 4);
INSERT INTO films_tree (id, title, open, parent) VALUES(7, 'Page 3', 0, 4);
INSERT INTO films_tree (id, title, open, parent) VALUES(8, 'Page 4', 0, 4);
INSERT INTO films_tree (id, title, open, parent) VALUES(9, 'Page 5', 0, 4);
INSERT INTO films_tree (id, title, open, parent) VALUES(10, 'Part 3', 0, 2);
INSERT INTO films_tree (id, title, open, parent) VALUES(11, 'The Godfather', 1, 1);
INSERT INTO films_tree (id, title, open, parent) VALUES(12, 'Part 1', 0, 11);
INSERT INTO films_tree (id, title, open, parent) VALUES(13, 'Part 2', 0, 11);

-- --------------------------------------------------------

--
-- Table structure for table 'packages_plain'
--

CREATE TABLE IF NOT EXISTS packages_plain (
  id int(11) NOT NULL AUTO_INCREMENT,
  package varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  size varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  architecture varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  section varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  priority varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  maintainer varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  version varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=26596 ;

--
-- Dumping data for table 'packages_plain'
--

INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(1, 'acx100-source', '229468', 'all', 'contrib/kernel', 'extra', 'Stefano Canepa ', '20080210-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(2, 'falien-arena-browser', '37128', 'all', 'contrib/games', 'extra', 'Debian Games Team ', '7.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(3, 'alien-arena-server', '130272', 'i386', 'contrib/games', 'extra', 'Debian Games Team', '7.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(4, 'alien-arena', '579978', 'i386', 'contrib/games', 'extra', 'This is a new value', '7.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(5, 'alsa-firmware-loaders', '32758', 'i386', 'contrib/sound', 'extra', 'Debian ALSA Maintainers', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(6, 'amoeba', '94052', 'i386', 'contrib/x11', 'optional', 'Steinar H. Gunderson ', '1.1-20');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(7, 'atari800', '763238', 'i386', 'contrib/otherosfs', 'optional', 'Antonin Kral ', '2.1.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(8, 'avifile-divx-plugin', '950', 'i386', 'contrib/video', 'optional', 'hDebian QA Group', '1:0.7.48~20090503.ds-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(9, 'avifile-win32-plugin', '97404', 'i386', 'contrib/video', 'optional', 'Debian QA Group ', '1:0.7.48~20090503.ds-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(10, 'avifile-xvid-plugin', '928', 'i386', 'contrib/video', 'optional', 'Debian QA Group ', '1:0.7.48~20090503.ds-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(11, 'b43-fwcutter', '17094', 'i386', 'contrib/utils', 'optional', 'Rene Engelhard ', '1:012-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(12, 'bgoffice-dict-downloader', '6374', 'all', 'contrib/text', 'extra', 'Debian Add-ons Bulgaria Project ', '0.03');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(13, 'cbedic', '24864', 'i386', 'contrib/text', 'optional', 'Anton Zinoviev ', '4.0-2+b3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(14, 'chocolate-doom', '304982', 'i386', 'contrib/games', 'optional', 'Debian Games Team ', '1.2.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(15, 'cl-sql-oracle', '34340', 'all', 'contrib/lisp', 'extra', 'Kevin M. Rosenberg ', '4.1.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(18, 'cltl', '8874', 'all', 'contrib/doc', 'optional', 'Debian Common Lisp Team ', '1.0.26');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(19, 'crafty-books-medium', '12890724', 'all', 'contrib/games', 'optional', 'Oliver Korff ', '1.0.debian1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(20, 'crafty-books-medtosmall', '1899430', 'all', 'contrib/games', 'optional', 'Oliver Korff ', '1.0.debian1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(21, 'crafty-books-small', '528438', 'all', 'contrib/games', 'optional', 'Oliver Korff ', '1.0.debian1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(22, 'dosemu', '2422360', 'i386', 'contrib/otherosfs', 'optional', 'Bart Martens ', '1.4.0+svn.1828-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(23, 'dynagen', '821012', 'all', 'contrib/net', 'optional', 'Erik Wenzel ', '0.11.0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(24, 'dynare-matlab', '78422', 'all', 'contrib/math', 'optional', 'Debian Octave Group ', '4.0.4-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(25, 'e-uae-dbg', '3179146', 'i386', 'contrib/debug', 'extra', 'Stephan SÃ¼rken ', '0.8.29-WIP4-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(26, 'e-uae', '946138', 'i386', 'contrib/otherosfs', 'extra', 'Stephan SÃ¼rken ', '0.8.29-WIP4-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(27, 'easyspice', '67692', 'i386', 'contrib/electronics', 'optional', 'Gudjon I. Gudjonsson ', '0.6.8-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(28, 'esix', '47044', 'all', 'contrib/otherosfs', 'optional', 'Vince Mulhollon ', '1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(29, 'exult-studio', '577280', 'i386', 'contrib/games', 'extra', 'JordÃ  Polo ', '1.2-13');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(30, 'exult', '978562', 'i386', 'contrib/games', 'extra', 'JordÃ  Polo ', '1.2-13');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(31, 'festvox-don', '646986', 'all', 'contrib/sound', 'extra', 'Matthias Urlichs ', '1.4.0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(32, 'festvox-rablpc16k', '5359618', 'all', 'contrib/sound', 'extra', 'Matthias Urlichs ', '1.4.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(33, 'festvox-rablpc8k', '3115688', 'all', 'contrib/sound', 'extra', 'Matthias Urlichs ', '1.4.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(34, 'flashplugin-nonfree-extrasound', '7952', 'i386', 'contrib/sound', 'optional', 'Petter Reinholdtsen ', '0.0.svn2431-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(35, 'flashplugin-nonfree', '17848', 'i386', 'contrib/web', 'optional', 'Bart Martens ', '1:2.8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(36, 'freemind', '402962', 'all', 'contrib/text', 'optional', 'Eric Lavarde ', '0.7.1-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(37, 'funguloids', '14779856', 'i386', 'contrib/games', 'extra', 'Debian Games Team ', '1.06-8+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(38, 'game-data-packager', '48516', 'all', 'contrib/games', 'optional', 'Debian Games Team ', '22');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(39, 'cpp-doc', '2740', 'i386', 'contrib/doc', 'optional', 'Debian GCC Maintainers ', '5:2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(40, 'gcc-doc', '2840', 'i386', 'contrib/doc', 'optional', 'Debian GCC Maintainers ', '5:2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(41, 'gcj-doc', '2862', 'i386', 'contrib/doc', 'optional', 'Debian GCC Maintainers ', '5:2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(42, 'gfortran-doc', '2724', 'i386', 'contrib/doc', 'optional', 'Debian GCC Maintainers ', '5:2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(43, 'gnat-doc', '2686', 'i386', 'contrib/doc', 'optional', 'Debian GCC Maintainers ', '5:2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(44, 'glest', '439766', 'i386', 'contrib/games', 'optional', 'Debian Games Team ', '3.2.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(45, 'gnome-speech-dectalk', '39810', 'i386', 'contrib/libs', 'optional', 'Mario Lang ', '1:0.4.25-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(46, 'gnome-speech-ibmtts', '39588', 'i386', 'contrib/libs', 'optional', 'Mario Lang ', '1:0.4.25-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(47, 'gnome-speech-swift', '38410', 'i386', 'contrib/libs', 'optional', 'Mario Lang ', '1:0.4.25-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(48, 'gnuboy-sdl', '77692', 'i386', 'contrib/games', 'optional', 'Davide Puricelli (evo) ', '1.0.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(49, 'gnuboy-svga', '77268', 'i386', 'contrib/games', 'optional', 'Davide Puricelli (evo) ', '1.0.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(50, 'gnuboy-x', '79218', 'i386', 'contrib/games', 'optional', 'Davide Puricelli (evo) ', '1.0.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(51, 'gnuvd-gnome', '5678', 'all', 'contrib/text', 'optional', 'Guus Sliepen ', '1.0.10-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(52, 'gnuvd', '10926', 'i386', 'contrib/text', 'optional', 'Guus Sliepen ', '1.0.10-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(53, 'googleearth-package', '10346', 'all', 'contrib/misc', 'optional', 'Wesley J. Landaker ', '0.5.6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(54, 'grinvin', '28944', 'i386', 'contrib/math', 'optional', 'Debian Java Maintainers ', '1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(55, 'gstreamer0.10-pitfdll', '80416', 'i386', 'contrib/libs', 'optional', 'Sebastian DrÃ¶ge ', '0.9.1.1+cvs20080215-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(56, 'gtktrain', '38922', 'i386', 'contrib/x11', 'optional', 'Masayuki Hatta (mhatta) ', '0.9b-13');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(57, 'gwp', '1855978', 'i386', 'contrib/games', 'optional', 'Lucas Di Pentima ', '0.4.0-1.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(58, 'hannah-foo2zjs', '17768', 'i386', 'contrib/text', 'optional', 'Michael Koch ', '1:1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(59, 'horae', '5179726', 'all', 'contrib/science', 'optional', 'Carlo Segre ', '070-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(60, 'hyperspec', '9760', 'all', 'contrib/doc', 'optional', 'Debian Common Lisp Team ', '1.28');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(61, 'ifeffit-doc', '2271980', 'all', 'contrib/doc', 'optional', 'Carlo Segre ', '2:1.2.10a-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(62, 'ifeffit', '2005186', 'i386', 'contrib/science', 'optional', 'Carlo Segre ', '2:1.2.10a-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(63, 'perl-ifeffit', '277810', 'i386', 'contrib/perl', 'optional', 'Carlo Segre ', '2:1.2.10a-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(64, 'python-ifeffit', '522928', 'i386', 'contrib/python', 'optional', 'Carlo Segre ', '2:1.2.10a-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(65, 'imgtex', '6140', 'all', 'contrib/utils', 'optional', 'Atsuhito KOHDA ', '0.20050123-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(66, 'ion3-scripts', '133230', 'all', 'contrib/x11', 'extra', 'Debian QA Group ', '20070515.debian-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(67, 'isight-firmware-tools', '34210', 'i386', 'contrib/graphics', 'extra', 'Nobuhiro Iwamatsu ', '1.4.2-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(68, 'ivtv-utils', '132072', 'i386', 'contrib/x11', 'extra', 'Debian MythTV Team ', '1.4.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(69, 'jabref', '2582694', 'all', 'contrib/tex', 'optional', 'new value', '2.5-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(70, 'java-package', '26576', 'all', 'contrib/java', 'optional', 'Debian Java Maintainers ', '0.42');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(71, 'jde', '1577706', 'all', 'contrib/devel', 'optional', 'Michael W. Olson (GNU address) ', '2.3.5.1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(72, 'jspwiki', '4414836', 'all', 'contrib/web', 'optional', 'Kalle Kivimaa ', '2.8.0-3.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(73, 'kbedic', '72912', 'i386', 'contrib/text', 'optional', 'Anton Zinoviev ', '4.0-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(74, 'lgc-pg', '173734', 'i386', 'contrib/utils', 'optional', 'Debian QA Group ', '0.32-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(75, 'lgeneral', '483824', 'i386', 'contrib/games', 'optional', 'Debian QA Group ', '1.1.1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(76, 'linux-wlan-ng-firmware', '52980', 'all', 'contrib/kernel', 'extra', 'Victor Seva ', '0.2.9+dfsg-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(77, 'liveice', '56726', 'i386', 'contrib/sound', 'optional', 'Jochen Friedrich ', '1.0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(78, 'libdbd-informix-perl', '238074', 'i386', 'contrib/perl', 'extra', 'Roderick Schertler ', '2008.0513-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(79, 'libdbd-oracle-perl', '391780', 'i386', 'contrib/perl', 'extra', 'Peter Eisentraut ', '1.21-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(80, 'libgooglecharts-ruby1.8', '6910', 'all', 'contrib/ruby', 'optional', 'Ryan Niebur ', '1.3.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(81, 'libgooglecharts-ruby', '2330', 'all', 'contrib/ruby', 'optional', 'Ryan Niebur ', '1.3.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(82, 'libgrinvin-core-java-doc', '504898', 'all', 'contrib/doc', 'optional', 'Debian Java Maintainers ', '1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(83, 'libgrinvin-core-java', '710634', 'all', 'contrib/java', 'optional', 'Debian Java Maintainers ', '1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(84, 'libgrinvin-factories-java', '92436', 'all', 'contrib/java', 'optional', 'Debian Java Maintainers ', '1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(85, 'libgrinvin-generators-java', '29028', 'all', 'contrib/java', 'optional', 'Debian Java Maintainers ', '1.0.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(86, 'libgrinvin-graphs-java', '169064', 'all', 'contrib/java', 'optional', 'Debian Java Maintainers ', '1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(87, 'libgrinvin-help-java', '107826', 'all', 'contrib/java', 'optional', 'Debian Java Maintainers ', '1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(88, 'libgrinvin-invariants-java', '163526', 'all', 'contrib/java', 'optional', 'Debian Java Maintainers ', '1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(89, 'libpdfbox-java-doc', '804148', 'all', 'contrib/doc', 'extra', 'gregor herrmann ', '0.7.3.dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(90, 'libpdfbox-java', '4499600', 'all', 'contrib/java', 'extra', 'gregor herrmann ', '0.7.3.dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(91, 'libpgplot-perl', '69092', 'i386', 'contrib/perl', 'optional', 'Debian Perl Group ', '1:2.20-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(92, 'libtrain-bin', '6524', 'i386', 'contrib/misc', 'optional', 'Masayuki Hatta (mhatta) ', '0.9b-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(93, 'libtrain-dev', '34800', 'i386', 'contrib/libdevel', 'optional', 'Masayuki Hatta (mhatta) ', '0.9b-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(94, 'libtrain1', '53966', 'i386', 'contrib/libs', 'optional', 'Masayuki Hatta (mhatta) ', '0.9b-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(95, 'libydpdict2-dev', '9632', 'i386', 'contrib/libdevel', 'optional', 'Marcin Owsiany ', '1.0.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(96, 'libydpdict2', '10352', 'i386', 'contrib/libs', 'optional', 'Marcin Owsiany ', '1.0.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(97, 'mathematica-fonts', '26302', 'all', 'contrib/fonts', 'extra', 'Atsuhito KOHDA ', '10');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(98, 'ttf-mathematica4.1', '2648', 'all', 'contrib/fonts', 'extra', 'Atsuhito KOHDA ', '10');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(99, 'microcode.ctl', '23230', 'i386', 'contrib/utils', 'optional', 'Giacomo Catenazzi ', '1.17-13');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(100, 'ttf-mscorefonts-installer', '35886', 'all', 'contrib/fonts', 'optional', 'Thijs Kinkhorst ', '3.0');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(101, 'nestra', '58562', 'i386', 'contrib/otherosfs', 'optional', 'Debian QA Group ', '0.66-10');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(102, 'netbeans-ide', '143850124', 'all', 'contrib/devel', 'optional', 'Debian QA Group ', '6.0.1+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(103, 'netbeans-platform', '6046748', 'all', 'contrib/devel', 'optional', 'Debian QA Group ', '6.0.1+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(104, 'netdisco-mibs-installer', '12124', 'all', 'contrib/net', 'extra', 'Oliver Gorwits ', '1.3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(105, 'nvidia-cg-toolkit', '36420', 'i386', 'contrib/libs', 'extra', 'Federico Di Gregorio ', '2.1.0017.deb1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(106, 'nvidia-kernel-common', '4088', 'all', 'contrib/kernel', 'optional', 'Debian NVIDIA Maintainers ', '20080825+1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(107, 'nvidia-settings', '779172', 'i386', 'contrib/x11', 'optional', 'Debian NVIDIA Maintainers ', '185.18.31-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(108, 'ogre-plugins-cgprogrammanager-dbg', '205496', 'i386', 'contrib/debug', 'extra', 'Debian Games Team ', '1.6.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(109, 'ogre-plugins-cgprogrammanager', '37446', 'i386', 'contrib/libs', 'optional', 'Debian Games Team ', '1.6.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(110, 'open-vm-source', '911094', 'all', 'contrib/admin', 'extra', 'Debian VMware Maintainers ', '2009.10.15-201664-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(111, 'open-vm-toolbox', '507116', 'i386', 'contrib/admin', 'extra', 'Debian VMware Maintainers ', '2009.10.15-201664-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(112, 'open-vm-tools-dbg', '2231002', 'i386', 'contrib/debug', 'extra', 'Debian VMware Maintainers ', '2009.10.15-201664-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(113, 'open-vm-tools', '648448', 'i386', 'contrib/admin', 'extra', 'Debian VMware Maintainers ', '2009.10.15-201664-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(114, 'opendict-plugins-lingvosoft', '11060', 'all', 'contrib/text', 'optional', 'KÄ™stutis BiliÅ«nas ', '0.8-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(115, 'openjump', '2681706', 'all', 'contrib/science', 'optional', 'Debian GIS Project ', '1.0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(116, 'openttd', '3394394', 'i386', 'contrib/games', 'optional', 'Matthijs Kooijman ', '0.7.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(117, 'ora2pg', '63722', 'all', 'contrib/misc', 'extra', 'JuliÃ¡n Moreno PatiÃ±o ', '5.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(118, 'playonlinux', '760738', 'all', 'contrib/otherosfs', 'optional', 'Debian Games Team ', '3.7.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(119, 'pose-skins', '6743366', 'all', 'contrib/otherosfs', 'extra', 'Lucas Wall ', '1.9-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(120, 'pose-doc', '1232532', 'all', 'contrib/doc', 'extra', 'Lucas Wall ', '3.5-9.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(121, 'pose-profile', '1106892', 'i386', 'contrib/otherosfs', 'extra', 'Lucas Wall ', '3.5-9.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(122, 'pose', '1094312', 'i386', 'contrib/otherosfs', 'extra', 'Lucas Wall ', '3.5-9.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(123, 'premail', '108676', 'all', 'contrib/mail', 'optional', 'Steve Kostecke ', '0.46-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(124, 'python-psyco-doc', '283942', 'all', 'contrib/doc', 'optional', 'Alexandre Fayolle ', '1.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(125, 'pvpgn', '770554', 'i386', 'contrib/net', 'optional', 'Radu Spineanu ', '1.8.1-2+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(126, 'python-cg', '92318', 'i386', 'contrib/python', 'optional', 'Debian Python Modules Team ', '0.14.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(127, 'python-pygpu', '20624', 'all', 'contrib/python', 'optional', 'Debian Python Modules Team ', '0.2.0a-629-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(128, 'python-doc', '7364', 'all', 'contrib/doc', 'optional', 'Matthias Klose ', '2.5.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(129, 'python-ldap-doc', '44280', 'all', 'contrib/doc', 'optional', 'Matej Vela ', '2.3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(130, 'python2.4-doc', '3470806', 'all', 'contrib/doc', 'optional', 'Matthias Klose ', '2.4.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(131, 'python2.5-doc', '3841314', 'all', 'contrib/doc', 'optional', 'Matthias Klose ', '2.5.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(132, 'qmail-qfilter', '14058', 'i386', 'contrib/mail', 'extra', 'Adam D. McKenna ', '1.5-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(133, 'qmailanalog-installer', '8272', 'all', 'contrib/mail', 'optional', 'Klaus Reimer ', '0.70.3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(134, 'qmhandle', '19454', 'all', 'contrib/mail', 'optional', 'Marcela Tiznado ', '1.3.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(135, 'r-cran-surveillance', '1390222', 'i386', 'contrib/gnu-r', 'optional', 'Debian Med Packaging Team ', '1.1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(136, 'rocksndiamonds', '469152', 'i386', 'contrib/games', 'extra', 'Dmitry E. Oboukhov ', '3.2.6.1+dfsg1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(137, 'rott-dbg', '492636', 'i386', 'contrib/debug', 'extra', 'Debian Games Team ', '1.1.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(138, 'rott', '301750', 'i386', 'contrib/games', 'optional', 'Debian Games Team ', '1.1.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(139, 'sabnzbdplus-theme-iphone', '52506', 'all', 'contrib/net', 'extra', 'JCF Ploemen (jcfp) ', '0.4.12-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(140, 'sabnzbdplus-theme-plush', '208952', 'all', 'contrib/net', 'extra', 'JCF Ploemen (jcfp) ', '0.4.12-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(141, 'sabnzbdplus-theme-smpl', '104524', 'all', 'contrib/net', 'extra', 'JCF Ploemen (jcfp) ', '0.4.12-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(142, 'sabnzbdplus', '205208', 'all', 'contrib/net', 'extra', 'JCF Ploemen (jcfp) ', '0.4.12-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(143, 'sapgui-package', '5698', 'all', 'contrib/misc', 'extra', 'Guido GÃ¼nther ', '0.0.5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(144, 'sauerbraten-wake6', '268560', 'all', 'contrib/games', 'optional', 'GÃ¼rkan SengÃ¼n ', '1.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(145, 'sauerbraten-dbg', '2172266', 'i386', 'contrib/debug', 'extra', 'Debian Games Team ', '0.0.20090504.dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(146, 'sauerbraten-server', '122296', 'i386', 'contrib/games', 'extra', 'Debian Games Team ', '0.0.20090504.dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(147, 'sauerbraten', '932792', 'i386', 'contrib/games', 'extra', 'Debian Games Team ', '0.0.20090504.dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(148, 'sdic-edict', '13780', 'all', 'contrib/text', 'optional', 'Taku YASUI ', '2.1.3-18');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(149, 'sdic-eijiro', '11692', 'all', 'contrib/text', 'optional', 'Taku YASUI ', '2.1.3-18');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(150, 'sdic-gene95', '17550', 'all', 'contrib/text', 'optional', 'Taku YASUI ', '2.1.3-18');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(151, 'sdic', '49102', 'all', 'contrib/text', 'optional', 'Taku YASUI ', '2.1.3-18');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(152, 'sivp', '2170376', 'i386', 'contrib/math', 'optional', 'Shiqi Yu ', '0.4.3-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(153, 'sixpack', '162232', 'all', 'contrib/science', 'optional', 'Carlo Segre ', '1:0.66-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(154, 'python-skype', '102566', 'all', 'contrib/python', 'extra', 'Debian Python Modules Team ', '1.0.31.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(155, 'skysentials', '12544', 'all', 'contrib/net', 'extra', 'Rafael Laboissiere ', '1.0.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(156, 'spectemu-common', '64022', 'i386', 'contrib/otherosfs', 'optional', 'Colin Watson ', '0.94a-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(157, 'spectemu-svga', '53952', 'i386', 'contrib/otherosfs', 'optional', 'Colin Watson ', '0.94a-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(158, 'spectemu-x11', '85856', 'i386', 'contrib/otherosfs', 'optional', 'Colin Watson ', '0.94a-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(159, 'sqldeveloper-package', '17212', 'all', 'contrib/misc', 'optional', 'Lazarus Long ', '0.2.3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(160, 'stella', '1145596', 'i386', 'contrib/otherosfs', 'optional', 'Mario Iseli ', '2.2-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(161, 'susv2', '2278', 'all', 'contrib/doc', 'extra', 'Jeff Bailey ', '1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(162, 'susv3', '2282', 'all', 'contrib/doc', 'extra', 'Jeff Bailey ', '6.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(163, 'svtools', '14572', 'all', 'contrib/misc', 'optional', 'Klaus Reimer ', '0.5-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(164, 'tightvnc-java', '104042', 'all', 'contrib/java', 'optional', 'Ola Lundqvist ', '1.2.7-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(165, 'tremulous-doc', '640890', 'all', 'contrib/doc', 'optional', 'Damien Laniel ', '1.1.0-4.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(166, 'tremulous-server', '353082', 'i386', 'contrib/games', 'optional', 'Damien Laniel ', '1.1.0-4.1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(167, 'tremulous', '672916', 'i386', 'contrib/games', 'optional', 'Damien Laniel ', '1.1.0-4.1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(168, 'uae-dbg', '153526', 'i386', 'contrib/debug', 'extra', 'Stephan SÃ¼rken ', '0.8.29-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(169, 'uae', '696094', 'i386', 'contrib/otherosfs', 'optional', 'Stephan SÃ¼rken ', '0.8.29-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(170, 'uqm-russian', '1046348', 'all', 'contrib/games', 'extra', 'Dmitry E. Oboukhov ', '1.0.2-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(171, 'uqm', '590578', 'i386', 'contrib/games', 'optional', 'Dmitry E. Oboukhov ', '0.6.2.dfsg-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(172, 'vice', '3971358', 'i386', 'contrib/otherosfs', 'optional', 'Laszlo Boszormenyi (GCS) ', '2.1.dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(173, 'videolink', '97616', 'i386', 'contrib/video', 'extra', 'Ben Hutchings ', '1.2.8-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(174, 'vmware-view-open-client', '422592', 'i386', 'contrib/x11', 'optional', 'Debian VMware Maintainers ', '4.0.0-207079+dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(175, 'vnc-java', '65800', 'all', 'contrib/java', 'optional', 'Ola Lundqvist ', '3.3.3r2-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(176, 'warsow-server', '290596', 'i386', 'contrib/games', 'optional', 'Debian Games Team ', '0.42.dfsg1-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(177, 'warsow', '2127516', 'i386', 'contrib/games', 'optional', 'Debian Games Team ', '0.42.dfsg1-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(178, 'wdq2wav', '16842', 'i386', 'contrib/utils', 'extra', 'Kevin M. Rosenberg ', '0.8.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(179, 'wnn7egg', '129806', 'all', 'contrib/utils', 'extra', 'ISHIKAWA Mutsumi ', '1.02-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(180, 'x-pgp-sig-el', '57472', 'all', 'contrib/lisp', 'optional', 'Takuo KITAME ', '1.3.5.1-4.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(181, 'xserver-xorg-video-ivtv-dbg', '67740', 'i386', 'contrib/debug', 'extra', 'Debian X Strike Force ', '1.1.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(182, 'xserver-xorg-video-ivtv', '23328', 'i386', 'contrib/x11', 'extra', 'Debian X Strike Force ', '1.1.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(183, 'xtrs', '331780', 'i386', 'contrib/otherosfs', 'extra', 'Branden Robinson ', '4.9c-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(184, 'ydpdict', '25878', 'i386', 'contrib/text', 'optional', 'Marcin Owsiany ', '1.0.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(185, '2vcard', '14300', 'all', 'utils', 'optional', 'Martin Albisetti ', '0.5-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(186, '3dchess', '34932', 'i386', 'games', 'optional', 'Debian Games Team ', '0.8.1-16');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(187, '4g8', '12164', 'i386', 'net', 'optional', 'LaMont Jones ', '1.0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(188, '6tunnel', '12810', 'i386', 'net', 'optional', 'Thomas Seyrat ', '0.11rc2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(189, '9base', '1148990', 'i386', 'utils', 'optional', 'Debian Suckless Maintainers ', '1:4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(190, '9menu', '14514', 'i386', 'x11', 'optional', 'Debian QA Group ', '1.8-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(191, '9mount-dbg', '6954', 'i386', 'debug', 'extra', 'Debian QA Group ', '1.3-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(192, '9mount', '11604', 'i386', 'admin', 'optional', 'Debian QA Group ', '1.3-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(193, '9wm', '24932', 'i386', 'x11', 'optional', 'Decklin Foster ', '1.2-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(194, 'a2ps-perl-ja', '14006', 'all', 'perl', 'optional', 'Debian QA Group ', '1.45-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(195, 'a2ps', '926602', 'i386', 'text', 'optional', 'Masayuki Hatta (mhatta) ', '1:4.14-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(196, 'liba52-0.7.4-dev', '46194', 'i386', 'libdevel', 'optional', 'Debian multimedia packages maintainers ', '0.7.4-12');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(197, 'liba52-0.7.4', '28048', 'i386', 'libs', 'optional', 'Debian multimedia packages maintainers ', '0.7.4-12');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(198, 'a56', '35270', 'i386', 'devel', 'extra', 'Robert Millan ', '1.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(199, 'a7xpg-data', '3527724', 'all', 'games', 'extra', 'Debian Games Team ', '0.11.dfsg1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(200, 'a7xpg', '154902', 'i386', 'games', 'extra', 'Debian Games Team ', '0.11.dfsg1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(201, 'aa3d', '8832', 'i386', 'graphics', 'optional', 'Uwe Hermann ', '1.0-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(202, 'python-aafigure', '38134', 'all', 'python', 'optional', 'Jakub Wilk ', '0.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(203, 'libaa-bin', '10070', 'i386', 'text', 'optional', 'Bart Martens ', '1.4p5-38');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(204, 'libaa1-dbg', '69292', 'i386', 'debug', 'extra', 'Bart Martens ', '1.4p5-38');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(205, 'libaa1-dev', '139610', 'i386', 'libdevel', 'optional', 'Bart Martens ', '1.4p5-38');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(206, 'libaa1', '58432', 'i386', 'libs', 'optional', 'Bart Martens ', '1.4p5-38');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(207, 'aap-doc', '676290', 'all', 'doc', 'optional', 'Debian QA Group ', '1.091-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(208, 'aap', '217620', 'all', 'devel', 'optional', 'Debian QA Group ', '1.091-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(209, 'aatv', '15892', 'i386', 'video', 'optional', 'Uwe Hermann ', '0.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(210, 'abakus', '364282', 'i386', 'kde', 'optional', 'Steffen Joeris ', '0.91-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(211, 'abby', '106806', 'i386', 'video', 'optional', 'Alejandro Garrido Mota ', '0.4.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(212, 'abcde', '115330', 'all', 'sound', 'optional', 'Jesus Climent ', '2.4.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(213, 'abcm2ps', '179858', 'i386', 'text', 'optional', 'Anselm Lingnau ', '5.9.5-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(214, 'abcmidi-yaps', '74816', 'i386', 'sound', 'extra', 'Anselm Lingnau ', '20070318-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(215, 'abcmidi', '178934', 'i386', 'sound', 'optional', 'Anselm Lingnau ', '20070318-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(216, 'abe-data', '2950864', 'all', 'games', 'optional', 'Bart Martens ', '1.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(217, 'abe', '41766', 'i386', 'games', 'optional', 'Bart Martens ', '1.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(218, 'abi-compliance-checker', '41414', 'all', 'devel', 'optional', 'Ryan Niebur ', '1.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(219, 'abicheck', '34316', 'all', 'devel', 'optional', 'Angel Ramos ', '1.2-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(220, 'r-cran-abind', '19444', 'all', 'gnu-r', 'optional', 'Dirk Eddelbuettel ', '1.1.0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(221, 'abinit-doc', '17017858', 'all', 'doc', 'extra', 'Debian Scientific Computing Team ', '5.3.4.dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(222, 'abinit', '4697326', 'i386', 'science', 'extra', 'Debian Scientific Computing Team ', '5.3.4.dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(223, 'abiword-common', '2005496', 'all', 'editors', 'optional', 'Masayuki Hatta (mhatta) ', '2.6.8-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(224, 'abiword-help', '1256628', 'all', 'doc', 'optional', 'Masayuki Hatta (mhatta) ', '2.6.8-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(225, 'abiword-plugin-goffice', '68874', 'i386', 'editors', 'optional', 'Masayuki Hatta (mhatta) ', '2.6.8-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(226, 'abiword-plugin-grammar', '45470', 'i386', 'editors', 'optional', 'Masayuki Hatta (mhatta) ', '2.6.8-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(227, 'abiword-plugin-mathview', '129904', 'i386', 'editors', 'optional', 'Masayuki Hatta (mhatta) ', '2.6.8-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(228, 'abiword-plugins', '34998', 'all', 'editors', 'optional', 'Masayuki Hatta (mhatta) ', '2.6.8-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(229, 'abiword', '2982130', 'i386', 'editors', 'optional', 'Masayuki Hatta (mhatta) ', '2.6.8-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(230, 'abntex', '325628', 'all', 'tex', 'optional', 'Otavio Salvador ', '0.9~beta2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(231, 'abook', '80858', 'i386', 'mail', 'optional', 'Gerfried Fuchs ', '0.5.6-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(232, 'aboot-base', '76442', 'all', 'admin', 'optional', 'Steve Langasek ', '1.0~pre20040408-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(233, 'aboot-cross', '28514', 'i386', 'admin', 'optional', 'Steve Langasek ', '1.0~pre20040408-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(234, 'abr2gbr', '6514', 'i386', 'graphics', 'extra', 'Alice Ferrazzi ', '1.0.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(235, 'abuse-frabs', '3312144', 'all', 'games', 'optional', 'Debian Games Team ', '2.11-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(236, 'abuse-lib', '834782', 'all', 'games', 'extra', 'Debian Games Team ', '2.00-18');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(237, 'abuse', '316218', 'i386', 'games', 'optional', 'Debian Games Team ', '1:0.7.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(238, 'accerciser', '1426622', 'all', 'gnome', 'extra', 'Debian Accessibility Team ', '1.8.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(239, 'acct', '107870', 'i386', 'admin', 'optional', 'Debian QA Group ', '6.4~pre1-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(240, 'ace-of-penguins', '241956', 'i386', 'games', 'optional', 'Jari Aalto ', '1.2-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(241, 'gperf-ace', '98372', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(242, 'libace-5.6.3', '689618', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(243, 'libace-dev', '1325252', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(244, 'libace-doc', '4743994', 'all', 'doc', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(245, 'libace-flreactor-5.6.3', '96200', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(246, 'libace-flreactor-dev', '74276', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(247, 'libace-foxreactor-5.6.3', '97248', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(248, 'libace-foxreactor-dev', '74230', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(249, 'libace-htbp-5.6.3', '107744', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(250, 'libace-htbp-dev', '87910', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(251, 'libace-qtreactor-5.6.3', '101716', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(252, 'libace-qtreactor-dev', '75672', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(253, 'libace-rmcast-5.6.3', '126266', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(254, 'libace-rmcast-dev', '82472', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(255, 'libace-ssl-5.6.3', '101120', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(256, 'libace-ssl-dev', '88334', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(257, 'libace-tkreactor-5.6.3', '96608', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(258, 'libace-tkreactor-dev', '74300', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(259, 'libace-tmcast-5.6.3', '88258', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(260, 'libace-tmcast-dev', '81234', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(261, 'libace-xtreactor-5.6.3', '96794', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(262, 'libace-xtreactor-dev', '74376', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(263, 'libacexml-5.6.3', '157640', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(264, 'libacexml-dev', '127808', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(265, 'libkokyu-5.6.3', '91536', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(266, 'libkokyu-dev', '305204', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(267, 'libtao-1.6.3', '2661244', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(268, 'libtao-dev', '943018', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(269, 'libtao-doc', '10201852', 'all', 'doc', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(270, 'libtao-flresource-1.6.3', '75528', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(271, 'libtao-flresource-dev', '73800', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(272, 'libtao-foxresource-1.6.3', '75204', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(273, 'libtao-foxresource-dev', '73826', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(274, 'libtao-orbsvcs-1.6.3', '6254302', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(275, 'libtao-orbsvcs-dev', '1043016', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(276, 'libtao-qtresource-1.6.3', '75754', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(277, 'libtao-qtresource-dev', '73860', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(278, 'libtao-tkresource-1.6.3', '75550', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(279, 'libtao-tkresource-dev', '73822', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(280, 'libtao-xtresource-1.6.3', '75830', 'i386', 'libs', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(281, 'libtao-xtresource-dev', '73842', 'i386', 'libdevel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(282, 'mpc-ace', '320292', 'all', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(283, 'tao-concurrency', '81642', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(284, 'tao-event', '76556', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(285, 'tao-ft', '155760', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(286, 'tao-ftrtevent', '99664', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(287, 'tao-idl', '841982', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(288, 'tao-ifr', '338566', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(289, 'tao-imr', '245860', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(290, 'tao-lifecycle', '89392', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(291, 'tao-load', '95090', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(292, 'tao-log', '101034', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(293, 'tao-naming', '82560', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(294, 'tao-notify', '87412', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(295, 'tao-rtevent', '84964', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(296, 'tao-scheduling', '114600', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(297, 'tao-time', '91090', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(298, 'tao-trading', '77286', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(299, 'tao-utils', '113794', 'i386', 'devel', 'optional', 'Debian ACE+TAO maintainers ', '5.6.3-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(300, 'r-cran-acepack', '29504', 'i386', 'gnu-r', 'optional', 'Dirk Eddelbuettel ', '1.3.2.2-2+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(301, 'acerhk-source', '39444', 'all', 'kernel', 'optional', 'Adam CÃ©cile (Le_Vert) ', '0.5.35-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(302, 'acfax', '35800', 'i386', 'hamradio', 'extra', 'Debian Hamradio Maintainers ', '981011-14.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(303, 'acheck-rules-fr', '7314', 'all', 'text', 'optional', 'Nicolas Bertolissio ', '0.6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(304, 'acheck-rules', '13618', 'all', 'text', 'optional', 'Nicolas Bertolissio ', '0.3.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(305, 'acheck', '35790', 'all', 'text', 'optional', 'Nicolas Bertolissio ', '0.5.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(306, 'achilles', '38252', 'i386', 'science', 'optional', 'Manfred Lichtenstern ', '2-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(307, 'ack-grep', '66982', 'all', 'utils', 'optional', 'Ryan Niebur ', '1.90-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(308, 'ack', '17770', 'i386', 'text', 'extra', 'Masayuki Hatta (mhatta) ', '1.39-12');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(309, 'acl', '60548', 'i386', 'utils', 'optional', 'Nathan Scott ', '2.2.48-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(310, 'libacl1-dev', '78788', 'i386', 'libdevel', 'extra', 'Nathan Scott ', '2.2.48-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(311, 'libacl1', '17724', 'i386', 'libs', 'required', 'Nathan Scott ', '2.2.48-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(312, 'acl2-books-certs', '1295318', 'all', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(313, 'acl2-books-source', '2973976', 'all', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(314, 'acl2-books', '21475906', 'i386', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(315, 'acl2-doc', '2400658', 'all', 'doc', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(316, 'acl2-emacs', '56260', 'all', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(317, 'acl2-infix-source', '88730', 'all', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(318, 'acl2-infix', '399634', 'i386', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(319, 'acl2-source', '2610826', 'all', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(320, 'acl2', '19379656', 'i386', 'math', 'optional', 'Camm Maguire ', '3.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(321, 'aclock.app', '28316', 'i386', 'gnustep', 'optional', 'GÃ¼rkan SengÃ¼n ', '0.2.3-3+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(322, 'acm', '752596', 'i386', 'games', 'optional', 'Phil Brooke ', '5.0-25');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(323, 'acm4', '896084', 'i386', 'games', 'optional', 'Phil Brooke ', '4.7-19');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(324, 'aconnectgui', '26154', 'i386', 'sound', 'optional', 'Paul Brossier ', '0.9.0rc2-1-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(325, 'acorn-fdisk', '28450', 'i386', 'admin', 'optional', 'Philip Blundell ', '3.0.6-6.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(326, 'acovea-results', '203792', 'all', 'doc', 'optional', 'Al Stone ', '20040329-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(327, 'acovea', '104138', 'i386', 'devel', 'optional', 'Al Stone ', '5.1.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(328, 'libacovea-5.1-5', '104286', 'i386', 'libs', 'optional', 'Al Stone ', '5.1.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(329, 'libacovea-dev', '78742', 'i386', 'devel', 'optional', 'Al Stone ', '5.1.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(330, 'acpi-support-base', '14752', 'all', 'admin', 'optional', 'Debian Acpi Team ', '0.123-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(331, 'acpi-support', '49236', 'i386', 'admin', 'optional', 'Debian Acpi Team ', '0.123-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(332, 'acpi', '15406', 'i386', 'utils', 'optional', 'Debian Acpi Team ', '1.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(333, 'iasl', '367092', 'i386', 'devel', 'optional', 'Mattia Dongili ', '20061109-0.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(334, 'acpid', '45234', 'i386', 'admin', 'optional', 'Debian Acpi Team ', '1.0.10-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(335, 'acpidump', '14408', 'i386', 'admin', 'optional', 'Mattia Dongili ', '20071116-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(336, 'acpitail', '7518', 'i386', 'utils', 'optional', 'Debian Acpi Team ', '0.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(337, 'acpitool-dbg', '141834', 'i386', 'debug', 'extra', 'Debian Acpi Team ', '0.5-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(338, 'acpitool', '47740', 'i386', 'utils', 'optional', 'Debian Acpi Team ', '0.5-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(339, 'libacr38u', '18040', 'i386', 'libs', 'extra', 'Laurent Bigonville ', '1.7.10-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(340, 'libacr38ucontrol-dev', '6398', 'i386', 'libdevel', 'extra', 'Laurent Bigonville ', '1.7.10-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(341, 'libacr38ucontrol0', '6288', 'i386', 'libs', 'extra', 'Laurent Bigonville ', '1.7.10-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(342, 'libactiveldap-ruby-doc', '34531542', 'all', 'doc', 'optional', 'Marc DequÃ¨nes (Duck) ', '1.0.9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(343, 'libactiveldap-ruby1.8', '84506', 'all', 'ruby', 'optional', 'Marc DequÃ¨nes (Duck) ', '1.0.9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(344, 'libactiveldap-ruby', '15822', 'all', 'ruby', 'optional', 'Marc DequÃ¨nes (Duck) ', '1.0.9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(345, 'ada-mode', '128818', 'all', 'editors', 'optional', 'Debian QA Group ', '3.6-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(346, 'ada-reference-manual', '2735014', 'all', 'doc', 'optional', 'Florian Weimer ', '20021112web-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(347, 'adacgi', '94806', 'i386', 'web', 'optional', 'Phil Brooke ', '1.6-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(348, 'adacontrol', '1979216', 'i386', 'devel', 'optional', 'Ludovic Brenta ', '1.9r4-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(349, 'adanaxisgpl-data', '18353778', 'all', 'games', 'optional', 'Debian Games Team ', '1.2.5.dfsg.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(350, 'adanaxisgpl', '1383178', 'i386', 'games', 'optional', 'Debian Games Team ', '1.2.5.dfsg.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(351, 'r-cran-adapt', '18992', 'i386', 'gnu-r', 'optional', 'Dirk Eddelbuettel ', '1.0-4-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(352, 'libadasockets-dev', '389928', 'i386', 'libdevel', 'extra', 'Phil Brooke ', '1.8.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(353, 'libadasockets1', '47224', 'i386', 'libs', 'extra', 'Phil Brooke ', '1.8.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(354, 'adblock-plus', '13402', 'all', 'web', 'optional', 'Dmitry E. Oboukhov ', '1.1.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(355, 'xul-ext-adblock-plus', '310478', 'all', 'web', 'optional', 'Dmitry E. Oboukhov ', '1.1.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(356, 'addresses-goodies-for-gnustep', '32980', 'i386', 'mail', 'optional', 'Eric Heintzmann ', '0.4.7-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(357, 'addresses.framework', '8378', 'all', 'gnustep', 'optional', 'Eric Heintzmann ', '0.4.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(358, 'addressmanager.app', '101602', 'i386', 'gnustep', 'optional', 'Eric Heintzmann ', '0.4.7-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(359, 'addressview.framework', '8368', 'all', 'gnustep', 'optional', 'Eric Heintzmann ', '0.4.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(360, 'libaddresses-dev', '16730', 'i386', 'libdevel', 'optional', 'Eric Heintzmann ', '0.4.7-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(361, 'libaddresses0', '70108', 'i386', 'libs', 'optional', 'Eric Heintzmann ', '0.4.7-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(362, 'libaddressview-dev', '12686', 'i386', 'libdevel', 'optional', 'Eric Heintzmann ', '0.4.7-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(363, 'libaddressview0', '72816', 'i386', 'libs', 'optional', 'Eric Heintzmann ', '0.4.7-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(364, 'adduser', '156872', 'all', 'admin', 'important', 'Debian Adduser Developers ', '3.111');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(365, 'adept', '371506', 'i386', 'kde', 'optional', 'Petr Rockai ', '3.0~beta7.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(366, 'adesklets', '221896', 'i386', 'x11', 'optional', 'Debian QA Group ', '0.6.1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(367, 'adjtimex', '55818', 'i386', 'admin', 'optional', 'James R. Van Zandt ', '1.28-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(368, 'admesh', '32534', 'i386', 'math', 'optional', 'VÃ­ctor PÃ©rez Pereira ', '0.95-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(369, 'adns-tools', '41252', 'i386', 'net', 'optional', 'Robert S. Edmonds ', '1.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(370, 'libadns1-dev', '73584', 'i386', 'libdevel', 'optional', 'Robert S. Edmonds ', '1.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(371, 'libadns1', '58400', 'i386', 'libs', 'optional', 'Robert S. Edmonds ', '1.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(372, 'libadolc-dev', '826088', 'i386', 'libdevel', 'optional', 'Barak A. Pearlmutter ', '1.10.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(373, 'libadolc-examples', '280866', 'i386', 'doc', 'optional', 'Barak A. Pearlmutter ', '1.10.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(374, 'libadolc0', '203546', 'i386', 'libs', 'optional', 'Barak A. Pearlmutter ', '1.10.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(375, 'adonthell-data', '9989464', 'all', 'games', 'optional', 'Debian Games Team ', '0.3.4.cvs.20080529-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(376, 'adonthell', '268974', 'i386', 'games', 'optional', 'Debian Games Team ', '0.3.5-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(377, 'adplay', '23782', 'i386', 'sound', 'optional', 'GÃ¼rkan SengÃ¼n ', '1.6-1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(378, 'adplug-utils', '26078', 'i386', 'utils', 'optional', 'Debian QA Group ', '2.0.1.dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(379, 'libadplug-dev', '233696', 'i386', 'libdevel', 'optional', 'Debian QA Group ', '2.0.1.dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(380, 'libadplug0c2a', '181160', 'i386', 'libs', 'optional', 'Debian QA Group ', '2.0.1.dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(381, 'adtool', '15518', 'i386', 'admin', 'optional', 'Jonathan Wiltshire ', '1.3.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(382, 'adun.app', '1262660', 'i386', 'gnustep', 'optional', 'Debian-Med Packaging Team ', '0.8.2-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(383, 'advancecomp', '325756', 'i386', 'utils', 'optional', 'Piotr Ozarowski ', '1.15-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(384, 'python-advas', '104530', 'all', 'python', 'optional', 'Patrick Winnertz ', '0.2.3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(385, 'advi-examples', '3824516', 'all', 'tex', 'optional', 'Debian OCaml Maintainers ', '1.6.0-15');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(386, 'advi', '951102', 'i386', 'tex', 'optional', 'Debian OCaml Maintainers ', '1.6.0-15');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(387, 'adzapper', '66140', 'all', 'web', 'optional', 'Ludovic Drolez ', '20090301-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(388, 'aee', '156204', 'i386', 'editors', 'optional', 'Mario Iseli ', '2.2.15b-3.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(389, 'aegir-provision', '45658', 'all', 'admin', 'optional', 'Antoine BeauprÃ© ', '0.3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(390, 'aegis-doc', '1964284', 'all', 'doc', 'optional', 'Christian Meder ', '4.24-5.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(391, 'aegis-tk', '162936', 'all', 'devel', 'optional', 'Christian Meder ', '4.24-5.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(392, 'aegis-web', '983062', 'i386', 'devel', 'optional', 'Christian Meder ', '4.24-5.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(393, 'aegis', '16007050', 'i386', 'vcs', 'optional', 'Christian Meder ', '4.24-5.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(394, 'aeolus', '112534', 'i386', 'sound', 'extra', 'Debian Multimedia Team ', '0.8.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(395, 'aes2501-wy', '12100', 'i386', 'graphics', 'optional', 'FingerForce Team ', '0.1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(396, 'aesfix', '11402', 'i386', 'utils', 'optional', 'Debian Forensics ', '1.0.1-1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(397, 'aeskeyfind', '7928', 'i386', 'utils', 'optional', 'Debian Forensics ', '1.0.0-1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(398, 'aeskulap', '499444', 'i386', 'science', 'optional', 'Debian-Med Packaging Team ', '0.2.2b1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(399, 'aespipe', '41394', 'i386', 'utils', 'optional', 'Debian Loop-AES Team ', '2.3e-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(400, 'aewan', '96736', 'i386', 'text', 'extra', 'Robert Lemmen ', '1.0.01-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(401, 'aewm++-goodies', '69962', 'i386', 'x11', 'optional', 'Chris Boyle ', '1.0-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(402, 'aewm++', '38770', 'i386', 'x11', 'optional', 'Chris Boyle ', '1.1.2-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(403, 'aewm', '52228', 'i386', 'x11', 'optional', 'Decklin Foster ', '1.3.12-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(404, 'afbackup-client', '521386', 'i386', 'utils', 'optional', 'Debian QA Group ', '3.5.3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(405, 'afbackup-common', '319750', 'all', 'utils', 'optional', 'Debian QA Group ', '3.5.3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(406, 'afbackup', '429214', 'i386', 'utils', 'optional', 'Debian QA Group ', '3.5.3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(407, 'affiche.app', '55370', 'i386', 'gnustep', 'optional', 'Hubert Chathi ', '0.6.0-7+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(408, 'afio', '80192', 'i386', 'utils', 'optional', 'Erik Schanze ', '2.5-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(409, 'afnix-doc', '192320', 'all', 'doc', 'optional', 'Paul Cager ', '1.5.2-3.3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(410, 'afnix', '1878610', 'i386', 'interpreters', 'optional', 'Paul Cager ', '1.5.2-3.3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(411, 'aft', '81832', 'all', 'text', 'optional', 'Robert Lemmen ', '2:5.097-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(412, 'afterstep', '3624130', 'i386', 'x11', 'optional', 'Robert Luberda ', '2.2.9-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(413, 'libafterimage-dev', '808748', 'i386', 'libdevel', 'optional', 'Robert Luberda ', '2.2.9-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(414, 'libafterimage0', '311292', 'i386', 'libs', 'optional', 'Robert Luberda ', '2.2.9-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(415, 'libafterstep1', '407118', 'i386', 'libs', 'optional', 'Robert Luberda ', '2.2.9-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(416, 'afuse', '16514', 'i386', 'utils', 'optional', 'Varun Hiremath ', '0.2-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(417, 'agave', '423634', 'i386', 'gnome', 'optional', 'Varun Hiremath ', '0.4.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(418, 'agda-bin', '2395958', 'i386', 'haskell', 'optional', 'Iain Lane ', '2.2.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(419, 'agedu', '41350', 'i386', 'utils', 'optional', 'Alexander Prinsier ', '8642-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(420, 'agenda.app', '135752', 'i386', 'gnustep', 'optional', 'Debian GNUstep maintainers ', '0.36-1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(421, 'libagg-dev', '516246', 'i386', 'libdevel', 'optional', 'Andrea Veri ', '2.5+dfsg1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(422, 'aggregate', '11344', 'i386', 'net', 'optional', 'Erik Wenzel ', '1.6-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(423, 'agsync-dev', '77144', 'i386', 'libdevel', 'optional', 'Debian QA Group ', '0.2-pre-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(424, 'agsync', '69190', 'i386', 'libs', 'optional', 'Debian QA Group ', '0.2-pre-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(425, 'agtl', '74446', 'all', 'python', 'extra', 'Heiko Stuebner ', '0.4.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(426, 'aiccu', '50180', 'i386', 'net', 'optional', 'Debian QA Group ', '20070115-10');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(427, 'aide-common', '87724', 'all', 'admin', 'optional', 'Aide Maintainers ', '0.13.1-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(428, 'aide-dynamic', '100318', 'i386', 'admin', 'optional', 'Aide Maintainers ', '0.13.1-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(429, 'aide-xen', '566450', 'i386', 'admin', 'optional', 'Aide Maintainers ', '0.13.1-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(430, 'aide', '534072', 'i386', 'admin', 'optional', 'Aide Maintainers ', '0.13.1-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(431, 'aiksaurus', '11818', 'i386', 'text', 'optional', 'Masayuki Hatta (mhatta) ', '1.2.1+dev-0.12-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(432, 'gaiksaurus', '9286', 'i386', 'text', 'optional', 'Masayuki Hatta (mhatta) ', '1.2.1+dev-0.12-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(433, 'libaiksaurus-1.2-0c2a', '23488', 'i386', 'libs', 'optional', 'Masayuki Hatta (mhatta) ', '1.2.1+dev-0.12-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(434, 'libaiksaurus-1.2-data', '317310', 'all', 'libs', 'optional', 'Masayuki Hatta (mhatta) ', '1.2.1+dev-0.12-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(435, 'libaiksaurus-1.2-dev', '25060', 'i386', 'libdevel', 'optional', 'Masayuki Hatta (mhatta) ', '1.2.1+dev-0.12-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(436, 'libaiksaurusgtk-1.2-0c2a', '33428', 'i386', 'libs', 'optional', 'Masayuki Hatta (mhatta) ', '1.2.1+dev-0.12-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(437, 'libaiksaurusgtk-1.2-dev', '32196', 'i386', 'libdevel', 'optional', 'Masayuki Hatta (mhatta) ', '1.2.1+dev-0.12-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(438, 'aircrack-ng', '1541508', 'i386', 'net', 'optional', 'Adam CÃ©cile (Le_Vert) ', '1:1.0~rc3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(439, 'airport-utils', '396618', 'all', 'net', 'optional', 'Julien BLACHE ', '1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(440, 'airstrike-common', '1877222', 'all', 'games', 'optional', 'Debian Games Team ', '0.99+1.0pre6a-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(441, 'airstrike', '45908', 'i386', 'games', 'optional', 'Debian Games Team ', '0.99+1.0pre6a-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(442, 'aish', '35848', 'i386', 'utils', 'optional', 'Atsushi KAMOSHIDA ', '1.13-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(443, 'ajaxterm', '40296', 'all', 'web', 'optional', 'Julien Valroff ', '0.10-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(444, 'akonadi-kde-resource-googledata', '97322', 'i386', 'net', 'extra', 'Debian Qt/KDE Maintainers ', '1.0.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(445, 'akonadi-dbg', '6679912', 'i386', 'debug', 'extra', 'Debian Qt/KDE Maintainers ', '1.2.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(446, 'akonadi-server', '175984', 'i386', 'net', 'extra', 'Debian Qt/KDE Maintainers ', '1.2.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(447, 'libakonadi-dev', '46146', 'i386', 'libdevel', 'extra', 'Debian Qt/KDE Maintainers ', '1.2.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(448, 'libakonadiprivate1', '576204', 'i386', 'libs', 'extra', 'Debian Qt/KDE Maintainers ', '1.2.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(449, 'alacarte', '102970', 'all', 'utils', 'optional', 'Debian GNOME Maintainers ', '0.12.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(450, 'alarm-clock-applet', '94038', 'i386', 'gnome', 'optional', 'Chow Loong Jin ', '0.2.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(451, 'alarm-clock', '615318', 'i386', 'utils', 'optional', 'Ryan Niebur ', '1.2.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(452, 'python-albatross-common', '52596', 'all', 'web', 'optional', 'Fabian Fagerholm ', '1.36-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(453, 'python-albatross-doc', '582732', 'all', 'doc', 'optional', 'Fabian Fagerholm ', '1.36-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(454, 'python-albatross', '85784', 'all', 'web', 'optional', 'Fabian Fagerholm ', '1.36-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(455, 'albumshaper', '4400704', 'i386', 'graphics', 'optional', 'Jano Kupec ', '2.1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(456, 'alcovebook-sgml-doc', '274786', 'all', 'doc', 'optional', 'Yann Dirson ', '0.1.2dfsg-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(457, 'alcovebook-sgml', '34348', 'all', 'text', 'optional', 'Yann Dirson ', '0.1.2dfsg-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(458, 'aldo', '71522', 'i386', 'hamradio', 'optional', 'Giuseppe Martino (denever) ', '0.7.5-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(459, 'ale', '323372', 'i386', 'graphics', 'optional', 'Ruben Molina ', '0.9.0.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(460, 'alevt', '82662', 'i386', 'x11', 'extra', 'Andreas Rottmann ', '1:1.6.1-10.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(461, 'alex', '257292', 'i386', 'haskell', 'optional', 'Ian Lynagh (wibble) ', '2.2-0.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(462, 'alex4-data', '580564', 'all', 'games', 'optional', 'Debian Games Team ', '1.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(463, 'alex4', '55696', 'i386', 'games', 'optional', 'Debian Games Team ', '1.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(464, 'alexandria', '911034', 'all', 'gnome', 'extra', 'Dafydd Harries ', '0.6.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(465, 'alien-hunter', '30470', 'all', 'science', 'optional', 'Debian Med Packaging Team ', '1.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(466, 'alien', '107256', 'all', 'admin', 'optional', 'Joey Hess ', '8.78');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(467, 'alienblaster-data', '6469626', 'all', 'games', 'extra', 'Debian Games Team ', '1.1.0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(468, 'alienblaster', '251398', 'i386', 'games', 'extra', 'Debian Games Team ', '1.1.0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(469, 'all-in-one-sidebar', '294448', 'all', 'web', 'optional', 'Debian Mozilla Extension Maintainers ', '0.7.10-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(470, 'allegro-demo-data', '369166', 'all', 'devel', 'optional', 'Debian allegro packages maintainers ', '3.9.36-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(471, 'allegro-demo', '123848', 'i386', 'games', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(472, 'allegro-examples', '353342', 'i386', 'utils', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(473, 'liballegro-doc', '1590930', 'all', 'doc', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(474, 'liballegro4.2-dev', '949706', 'i386', 'libdevel', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(475, 'liballegro4.2-plugin-arts', '4508', 'i386', 'libs', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(476, 'liballegro4.2-plugin-esd', '4822', 'i386', 'libs', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(477, 'liballegro4.2-plugin-jack', '5278', 'i386', 'libs', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(478, 'liballegro4.2-plugin-svgalib', '6592', 'i386', 'libs', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(479, 'liballegro4.2', '539994', 'i386', 'libs', 'optional', 'Debian allegro packages maintainers ', '2:4.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(480, 'alleyoop', '158396', 'i386', 'devel', 'optional', 'Debian GNOME Maintainers ', '0.9.5-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(481, 'alltray', '59552', 'i386', 'x11', 'optional', 'Carlos C Soto ', '0.69-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(482, 'almanah', '101278', 'i386', 'gnome', 'extra', 'Angel Abad (Ikusnet SLL) ', '0.6.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(483, 'libalogg-dev', '41966', 'i386', 'libdevel', 'optional', 'Debian allegro packages maintainers ', '1.3.7-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(484, 'libalogg1', '16850', 'i386', 'libs', 'optional', 'Debian allegro packages maintainers ', '1.3.7-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(485, 'alqalam', '876684', 'all', 'tex', 'optional', 'Debian TeX maintainers ', '0.2-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(486, 'alsa-base', '283924', 'all', 'sound', 'optional', 'Debian ALSA Maintainers ', '1.0.21+dfsg-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(487, 'alsa-source', '3519460', 'all', 'kernel', 'optional', 'Debian ALSA Maintainers ', '1.0.21+dfsg-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(488, 'linux-sound-base', '28272', 'all', 'sound', 'optional', 'Debian ALSA Maintainers ', '1.0.21+dfsg-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(489, 'lib64asound2-dev', '493034', 'i386', 'libdevel', 'optional', 'Debian ALSA Maintainers ', '1.0.21a-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(490, 'lib64asound2', '364802', 'i386', 'libs', 'optional', 'Debian ALSA Maintainers ', '1.0.21a-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(491, 'libasound2-dev', '508152', 'i386', 'libdevel', 'optional', 'Debian ALSA Maintainers ', '1.0.21a-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(492, 'libasound2-doc', '1438240', 'all', 'doc', 'optional', 'Debian ALSA Maintainers ', '1.0.21a-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(493, 'libasound2', '373474', 'i386', 'libs', 'optional', 'Debian ALSA Maintainers ', '1.0.21a-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(494, 'alsa-oss', '30998', 'i386', 'sound', 'optional', 'Debian ALSA Maintainers ', '1.0.17-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(495, 'lib64asound2-plugins', '46612', 'i386', 'libs', 'optional', 'Debian ALSA Maintainers ', '1.0.21-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(496, 'libasound2-plugins', '73350', 'i386', 'libs', 'optional', 'Debian ALSA Maintainers ', '1.0.21-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(497, 'alsa-tools-gui', '261172', 'i386', 'sound', 'extra', 'Debian ALSA Maintainers ', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(498, 'alsa-tools', '81936', 'i386', 'sound', 'extra', 'Debian ALSA Maintainers ', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(499, 'ld10k1', '106626', 'i386', 'sound', 'extra', 'Debian ALSA Maintainers ', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(500, 'liblo10k1-0', '31252', 'i386', 'libs', 'extra', 'Debian ALSA Maintainers ', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(501, 'liblo10k1-dev', '37196', 'i386', 'devel', 'extra', 'Debian ALSA Maintainers ', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(502, 'qlo10k1', '141602', 'i386', 'sound', 'extra', 'Debian ALSA Maintainers ', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(503, 'alsa-utils', '1096902', 'i386', 'sound', 'optional', 'Debian ALSA Maintainers ', '1.0.21-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(504, 'alsamixergui', '30530', 'i386', 'sound', 'optional', 'Paul Brossier ', '0.9.0rc2-1-9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(505, 'alsaplayer-alsa', '32660', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(506, 'alsaplayer-common', '166898', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(507, 'alsaplayer-daemon', '32968', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(508, 'alsaplayer-esd', '30882', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(509, 'alsaplayer-gtk', '191464', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(510, 'alsaplayer-jack', '34748', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(511, 'alsaplayer-nas', '32808', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(512, 'alsaplayer-oss', '31022', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(513, 'alsaplayer-text', '33750', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(514, 'alsaplayer-xosd', '33688', 'i386', 'sound', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(515, 'libalsaplayer-dev', '89270', 'i386', 'libdevel', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(516, 'libalsaplayer0', '37068', 'i386', 'libs', 'optional', 'Tony Palma ', '0.99.80-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(517, 'alt-ergo', '427948', 'i386', 'math', 'optional', 'Debian OCaml Maintainers ', '0.9-1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(518, 'altermime', '55086', 'i386', 'mail', 'optional', 'Julien Valroff ', '0.3.10-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(519, 'altree-examples', '400662', 'all', 'science', 'optional', 'Debian-Med Packaging Team ', '1.0.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(520, 'altree', '254424', 'i386', 'science', 'optional', 'Debian-Med Packaging Team ', '1.0.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(521, 'alure-doc', '18744', 'all', 'doc', 'optional', 'Debian Games Team ', '1.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(522, 'libalure-dev', '28398', 'i386', 'libdevel', 'optional', 'Debian Games Team ', '1.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(523, 'libalure1-dbg', '72788', 'i386', 'debug', 'extra', 'Debian Games Team ', '1.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(524, 'libalure1', '22000', 'i386', 'libs', 'optional', 'Debian Games Team ', '1.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(525, 'am-utils-doc', '700088', 'all', 'doc', 'extra', 'Tim Cutts ', '6.1.5-15');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(526, 'am-utils', '396686', 'i386', 'net', 'extra', 'Tim Cutts ', '6.1.5-15');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(527, 'libamu-dev', '45272', 'i386', 'libdevel', 'extra', 'Tim Cutts ', '6.1.5-15');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(528, 'libamu4', '164778', 'i386', 'libs', 'extra', 'Tim Cutts ', '6.1.5-15');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(529, 'amanda-client', '191836', 'i386', 'utils', 'optional', 'Bdale Garbee ', '1:2.6.1p1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(530, 'amanda-common', '1505410', 'i386', 'utils', 'optional', 'Bdale Garbee ', '1:2.6.1p1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(531, 'amanda-server', '436580', 'i386', 'utils', 'optional', 'Bdale Garbee ', '1:2.6.1p1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(532, 'amap-align', '127424', 'i386', 'science', 'optional', 'Debian-Med Packaging Team ', '2.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(533, 'python-amara', '53270', 'all', 'python', 'extra', 'David Villa Alises ', '1.2a2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(534, 'amarok-common', '3305624', 'all', 'sound', 'optional', 'Modestas Vainius ', '2.2.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(535, 'amarok-dbg', '43865924', 'i386', 'debug', 'extra', 'Modestas Vainius ', '2.2.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(536, 'amarok-utils', '247498', 'i386', 'utils', 'optional', 'Modestas Vainius ', '2.2.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(537, 'amarok', '7154388', 'i386', 'sound', 'optional', 'Modestas Vainius ', '2.2.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(538, 'amavisd-new-milter', '34884', 'i386', 'mail', 'extra', 'Brian May ', '1:2.6.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(539, 'amavisd-new', '888192', 'all', 'mail', 'extra', 'Brian May ', '1:2.6.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(540, 'amb-plugins', '17692', 'i386', 'sound', 'extra', 'Debian Multimedia Team ', '0.3.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(541, 'amd64-libs-dev', '31328', 'i386', 'libdevel', 'optional', 'Daniel Jacobowitz ', '1.4+nmu1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(542, 'amd64-libs', '33800', 'i386', 'libs', 'optional', 'Daniel Jacobowitz ', '1.4+nmu1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(543, 'amide', '976242', 'i386', 'graphics', 'optional', 'Dominique Belhachemi ', '0.9.1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(544, 'amideco', '11472', 'i386', 'utils', 'optional', 'Uwe Hermann ', '0.31e-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(545, 'amiga-fdisk-cross', '18590', 'i386', 'admin', 'extra', 'Christian T. Steigies ', '0.04-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(546, 'amora-server', '15686', 'i386', 'x11', 'extra', 'Axel Beckert ', '1.1-1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(547, 'ampache-themes', '2965628', 'all', 'web', 'extra', 'Charlie Smotherman ', '3.4.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(548, 'ampache', '1781492', 'all', 'web', 'optional', 'Charlie Smotherman ', '3.5.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(549, 'amphetamine-data', '944964', 'all', 'games', 'optional', 'Debian Games Team ', '0.8.7-12');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(550, 'amphetamine', '100562', 'i386', 'games', 'optional', 'Debian Games Team ', '0.8.10-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(551, 'ample', '38890', 'i386', 'sound', 'optional', 'Rene Mayorga ', '0.5.7-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(552, 'libamrita-ruby1.8', '143748', 'all', 'ruby', 'optional', 'TANIGUCHI Takaki ', '1.0.2-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(553, 'ams', '384768', 'i386', 'sound', 'optional', 'Debian Multimedia Team ', '1.8.8~rc2-3.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(554, 'amsn-data', '3254124', 'all', 'x11', 'optional', 'Muammar El Khatib ', '0.97.2~debian-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(555, 'amsn', '269736', 'i386', 'x11', 'optional', 'Muammar El Khatib ', '0.97.2~debian-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(556, 'amsynth', '266808', 'i386', 'sound', 'optional', 'Debian Multimedia Team ', '1.2.0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(557, 'amtterm', '18134', 'i386', 'net', 'extra', 'Reinhard Tartler ', '1.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(558, 'gamt', '20152', 'i386', 'net', 'extra', 'Reinhard Tartler ', '1.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(559, 'amule-emc', '16046', 'i386', 'utils', 'optional', 'Sandro Tosi ', '0.5.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(560, 'amule-common', '2425196', 'all', 'net', 'optional', 'Adeodato SimÃ³ ', '2.2.5-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(561, 'amule-daemon', '1172070', 'i386', 'net', 'optional', 'Adeodato SimÃ³ ', '2.2.5-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(562, 'amule-utils-gui', '1279660', 'i386', 'net', 'optional', 'Adeodato SimÃ³ ', '2.2.5-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(563, 'amule-utils', '453092', 'i386', 'net', 'optional', 'Adeodato SimÃ³ ', '2.2.5-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(564, 'amule', '1837034', 'i386', 'net', 'optional', 'Adeodato SimÃ³ ', '2.2.5-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(565, 'an', '13830', 'i386', 'games', 'optional', 'Paul Martin ', '0.95-3.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(566, 'anacron', '30144', 'i386', 'admin', 'optional', 'Peter Eisentraut ', '2.3-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(567, 'analog', '1367292', 'i386', 'web', 'optional', 'Bradley Smith ', '2:6.0-19');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(568, 'anarchism', '6623686', 'all', 'doc', 'optional', 'Ed Boraas ', '11.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(569, 'and', '25978', 'i386', 'misc', 'extra', 'Jerome Warnier ', '1.2.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(570, 'angband-doc', '943562', 'all', 'doc', 'optional', 'Manoj Srivastava ', '3.0.3.5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(571, 'angband', '1756782', 'i386', 'games', 'optional', 'Chris Carr ', '1:3.1.1.1626-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(572, 'angrydd', '4694208', 'all', 'games', 'optional', 'Daniel Watkins ', '1.0.1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(573, 'animals', '18526', 'i386', 'games', 'optional', 'Jim Lynch ', '20031130-2.4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(574, 'anjuta-common', '6148318', 'all', 'devel', 'optional', 'Rob Bradford ', '2:2.26.2.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(575, 'anjuta-dbg', '4580682', 'i386', 'debug', 'extra', 'Rob Bradford ', '2:2.26.2.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(576, 'anjuta-dev', '424110', 'i386', 'devel', 'optional', 'Rob Bradford ', '2:2.26.2.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(577, 'anjuta', '2465868', 'i386', 'gnome', 'optional', 'Rob Bradford ', '2:2.26.2.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(578, 'anki', '956882', 'all', 'misc', 'optional', 'Andreas Bombe ', '0.9.9.7.8-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(579, 'ann-tools', '13898', 'i386', 'math', 'optional', 'Debian Scientific Computing Team ', '1.1.1+doc-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(580, 'libann-dev', '372234', 'i386', 'libdevel', 'optional', 'Debian Scientific Computing Team ', '1.1.1+doc-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(581, 'libann0', '29252', 'i386', 'libs', 'optional', 'Debian Scientific Computing Team ', '1.1.1+doc-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(582, 'anon-proxy', '133376', 'i386', 'web', 'optional', 'David Spreen ', '00.05.38+20081230-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(583, 'ant-contrib', '265184', 'all', 'java', 'extra', 'Debian Java Maintainers ', '1.0~b3+svn177-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(584, 'ant-phone', '115954', 'i386', 'net', 'extra', 'Roland Stigge ', '0.2.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(585, 'ant-doc', '3269036', 'all', 'doc', 'optional', 'Debian Java Maintainers ', '1.7.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(586, 'ant-gcj', '1208244', 'i386', 'java', 'optional', 'Debian Java Maintainers ', '1.7.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(587, 'ant-optional-gcj', '656772', 'i386', 'java', 'optional', 'Debian Java Maintainers ', '1.7.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(588, 'ant-optional', '657230', 'all', 'java', 'optional', 'Debian Java Maintainers ', '1.7.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(589, 'ant', '1297496', 'all', 'java', 'optional', 'Debian Java Maintainers ', '1.7.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(590, 'anteater', '113950', 'i386', 'mail', 'optional', 'Andrea Capriotti ', '0.4.5-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(591, 'antennavis', '54346', 'i386', 'hamradio', 'optional', 'Debian QA Group ', '0.3-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(592, 'anthy-el', '36204', 'all', 'lisp', 'optional', 'NOKUBI Takatsugu ', '9100e-3.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(593, 'anthy', '3372644', 'i386', 'utils', 'optional', 'NOKUBI Takatsugu ', '9100e-3.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(594, 'libanthy-dev', '197582', 'i386', 'libdevel', 'optional', 'NOKUBI Takatsugu ', '9100e-3.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(595, 'libanthy0', '166426', 'i386', 'libs', 'optional', 'NOKUBI Takatsugu ', '9100e-3.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(596, 'antigravitaattori', '1492934', 'i386', 'games', 'optional', 'Debian Games Team ', '0.0.3-2+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(597, 'antiword', '150904', 'i386', 'text', 'optional', 'Erik Schanze ', '0.37-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(598, 'antlr-doc', '891774', 'all', 'doc', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(599, 'antlr', '10932', 'all', 'devel', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(600, 'cantlr', '10412', 'i386', 'devel', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(601, 'libantlr-dev', '316212', 'i386', 'libdevel', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(602, 'libantlr-java-gcj', '571250', 'i386', 'devel', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(603, 'libantlr-java', '430744', 'all', 'java', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(604, 'libantlr2.7-cil', '47948', 'all', 'cli-mono', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(605, 'python-antlr', '23396', 'all', 'python', 'optional', 'Debian Java Maintainers ', '2.7.7-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(606, 'antlr3-gcj', '494584', 'i386', 'devel', 'optional', 'Debian Java Maintainers ', '3.0.1+dfsg-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(607, 'antlr3', '532970', 'all', 'devel', 'optional', 'Debian Java Maintainers ', '3.0.1+dfsg-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(608, 'anubis', '244644', 'i386', 'net', 'optional', 'Krzysztof Burghardt ', '4.1.1+dfsg1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(609, 'anypaper', '47172', 'i386', 'utils', 'extra', 'Alejandro Garrido Mota ', '1.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(610, 'anyremote-doc', '1232546', 'all', 'doc', 'extra', 'Juan Angulo Moreno ', '4.18.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(611, 'anyremote', '282294', 'i386', 'utils', 'extra', 'Juan Angulo Moreno ', '4.18.1-1+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(612, 'anyremote2html', '259536', 'all', 'web', 'extra', 'Philipp Huebner ', '1.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(613, 'aoetools', '34146', 'i386', 'admin', 'optional', 'David MartÃ­nez Moreno ', '30-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(614, 'aoeui', '67572', 'i386', 'editors', 'optional', 'Ryan Kavanagh ', '1.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(615, 'aolserver4-nsimap', '26380', 'i386', 'httpd', 'optional', 'Riccardo Setti ', '3.2.3-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(616, 'aolserver4-nsldap', '17122', 'i386', 'httpd', 'optional', 'Riccardo Setti ', '0.8-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(617, 'aolserver4-nsmysql', '23122', 'i386', 'httpd', 'optional', 'Francesco Paolo Lovergine ', '0.6-9+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(618, 'aolserver4-nsopenssl', '74456', 'i386', 'httpd', 'optional', 'Francesco Paolo Lovergine ', '3.0beta26-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(619, 'aolserver4-nspostgres', '23690', 'i386', 'httpd', 'optional', 'Francesco Paolo Lovergine ', '4.5-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(620, 'aolserver4-nssha1', '8394', 'i386', 'httpd', 'optional', 'Francesco Paolo Lovergine ', '0.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(621, 'aolserver4-nssqlite3', '17192', 'i386', 'net', 'optional', 'Francesco Paolo Lovergine ', '0.9-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(622, 'aolserver4-nsxml', '5178', 'i386', 'httpd', 'optional', 'Riccardo Setti ', '1.5-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(623, 'aolserver4-core-4.5.1', '307160', 'i386', 'web', 'optional', 'Francesco Paolo Lovergine ', '4.5.1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(624, 'aolserver4-core', '70714', 'all', 'httpd', 'optional', 'Francesco Paolo Lovergine ', '4.5.1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(625, 'aolserver4-daemon', '172266', 'i386', 'web', 'optional', 'Francesco Paolo Lovergine ', '4.5.1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(626, 'aolserver4-dev', '956064', 'i386', 'httpd', 'optional', 'Francesco Paolo Lovergine ', '4.5.1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(627, 'aolserver4-doc', '3324132', 'all', 'doc', 'optional', 'Francesco Paolo Lovergine ', '4.5.1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(628, 'ap-utils', '393730', 'i386', 'net', 'optional', 'Ben Hutchings ', '1.5-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(629, 'libapache2-redirtoservname', '5204', 'i386', 'httpd', 'optional', 'Simon Richter ', '0.1.2-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(630, 'apache2-dbg', '2695358', 'i386', 'debug', 'extra', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(631, 'apache2-doc', '2281508', 'all', 'doc', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(632, 'apache2-mpm-event', '2292', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(633, 'apache2-mpm-itk', '2318', 'i386', 'httpd', 'extra', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(634, 'apache2-mpm-prefork', '2318', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(635, 'apache2-mpm-worker', '2262', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(636, 'apache2-prefork-dev', '138034', 'i386', 'httpd', 'extra', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(637, 'apache2-suexec-custom', '93138', 'i386', 'httpd', 'extra', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(638, 'apache2-suexec', '91560', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(639, 'apache2-threaded-dev', '139228', 'i386', 'httpd', 'extra', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(640, 'apache2-utils', '152992', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(641, 'apache2.2-bin', '1291480', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(642, 'apache2.2-common', '292588', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(643, 'apache2', '1374', 'i386', 'httpd', 'optional', 'Debian Apache Maintainers ', '2.2.14-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(644, 'apachetop', '34574', 'i386', 'admin', 'optional', 'Debian QA Group ', '0.12.6-12');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(645, 'apbs', '376404', 'i386', 'science', 'optional', 'Debichem Team ', '1.1.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(646, 'apcalc-common', '936938', 'all', 'math', 'optional', 'Martin Buck ', '2.12.3.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(647, 'apcalc-dev', '548366', 'i386', 'devel', 'optional', 'Martin Buck ', '2.12.3.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(648, 'apcalc', '304768', 'i386', 'math', 'optional', 'Martin Buck ', '2.12.3.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(649, 'apcupsd-cgi', '52244', 'i386', 'web', 'extra', 'Debian QA Group ', '3.14.6-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(650, 'apcupsd-doc', '2600226', 'all', 'doc', 'extra', 'Debian QA Group ', '3.14.6-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(651, 'apcupsd', '243706', 'i386', 'admin', 'extra', 'Debian QA Group ', '3.14.6-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(652, 'apel', '142722', 'all', 'editors', 'optional', 'Tatsuya Kinoshita ', '10.7-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(653, 'apertium-dbus', '9430', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.1-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(654, 'apertium-en-ca', '2852074', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.8.9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(655, 'apertium-en-es', '1555766', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.6.0-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(656, 'apertium-eo-ca', '977266', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.9.0-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(657, 'apertium-eo-es', '925118', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.9.0-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(658, 'apertium-es-ca', '4236670', 'i386', 'misc', 'extra', 'Francis Tyers ', '1.1.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(659, 'apertium-es-gl', '674500', 'i386', 'misc', 'extra', 'Francis Tyers ', '1.0.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(660, 'apertium-es-pt', '902996', 'i386', 'misc', 'optional', 'Francis Tyers ', '1.0.3-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(661, 'apertium-es-ro', '1139636', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.7.1-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(662, 'apertium-eu-es', '1603524', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.3.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(663, 'apertium-fr-ca', '930554', 'i386', 'misc', 'optional', 'Francis Tyers ', '1.0.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(664, 'apertium-fr-es', '3762662', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.9.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(665, 'apertium-oc-ca', '2657142', 'i386', 'misc', 'extra', 'Francis Tyers ', '1.0.5-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(666, 'apertium-oc-es', '2550084', 'i386', 'misc', 'extra', 'Francis Tyers ', '1.0.5-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(667, 'apertium-pt-ca', '559416', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.8.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(668, 'apertium-pt-gl', '951234', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.9.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(669, 'apertium-tolk', '29152', 'i386', 'misc', 'extra', 'Francis Tyers ', '0.2-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(670, 'apertium', '349438', 'i386', 'misc', 'optional', 'Francis Tyers ', '3.1.0-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(671, 'libapertium3-3.1-0-dev', '468520', 'i386', 'libdevel', 'optional', 'Francis Tyers ', '3.1.0-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(672, 'libapertium3-3.1-0', '338538', 'i386', 'libs', 'optional', 'Francis Tyers ', '3.1.0-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(673, 'apf-firewall', '103934', 'all', 'net', 'optional', 'Giuseppe Iuculano ', '9.7+rev1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(674, 'apf-client', '73298', 'i386', 'net', 'optional', 'Juan A. Diaz ', '0.8.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(675, 'apf-server', '75946', 'i386', 'net', 'optional', 'Juan A. Diaz ', '0.8.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(676, 'apg', '52816', 'i386', 'admin', 'optional', 'Marc Haber ', '2.2.3.dfsg.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(677, 'apgdiff', '60608', 'all', 'misc', 'extra', 'Christoph Berg ', '1.3-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(678, 'libapiextractor-dbg', '2533034', 'i386', 'debug', 'extra', 'Didier Raboud ', '0.3.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(679, 'libapiextractor-dev', '26702', 'i386', 'libdevel', 'optional', 'Didier Raboud ', '0.3.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(680, 'libapiextractor0', '459612', 'i386', 'libs', 'optional', 'Didier Raboud ', '0.3.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(681, 'apmd', '54058', 'i386', 'admin', 'optional', 'Anibal Monsalve Salazar ', '3.2.2-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(682, 'libapm-dev', '26964', 'i386', 'libdevel', 'optional', 'Anibal Monsalve Salazar ', '3.2.2-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(683, 'libapm1', '26502', 'i386', 'libs', 'optional', 'Anibal Monsalve Salazar ', '3.2.2-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(684, 'xapm', '28426', 'i386', 'x11', 'optional', 'Anibal Monsalve Salazar ', '3.2.2-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(685, 'apoo', '136702', 'all', 'misc', 'optional', 'Rogerio Reis ', '2.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(686, 'app-install-data', '6903896', 'all', 'x11', 'optional', 'Julian Andres Klode ', '2009.06.06');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(687, 'apparix', '93336', 'i386', 'utils', 'extra', 'Armin Berres ', '07-261-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(688, 'libappconfig-perl', '88586', 'all', 'perl', 'optional', 'Stefan Hornburg (Racke) ', '1.56-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(689, 'approx', '1072074', 'i386', 'admin', 'optional', 'Eric Cooper ', '4.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(690, 'libapq-postgresql-dbg', '21988', 'i386', 'debug', 'extra', 'Adrian-Ken Rueegsegger ', '3.0~b1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(691, 'libapq-postgresql-dev', '95104', 'i386', 'libdevel', 'optional', 'Adrian-Ken Rueegsegger ', '3.0~b1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(692, 'libapq3-postgresql', '50702', 'i386', 'libs', 'optional', 'Adrian-Ken Rueegsegger ', '3.0~b1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(693, 'libapq-common-dbg', '10172', 'i386', 'debug', 'extra', 'Adrian-Ken Rueegsegger ', '3.0~b1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(694, 'libapq-common-dev', '595702', 'i386', 'libdevel', 'optional', 'Adrian-Ken Rueegsegger ', '3.0~b1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(695, 'libapq3-common', '53588', 'i386', 'libs', 'optional', 'Adrian-Ken Rueegsegger ', '3.0~b1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(696, 'libaprutil1-dbd-freetds', '27480', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(697, 'libaprutil1-dbd-mysql', '29418', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(698, 'libaprutil1-dbd-odbc', '32880', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(699, 'libaprutil1-dbd-pgsql', '28954', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(700, 'libaprutil1-dbd-sqlite3', '27078', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(701, 'libaprutil1-dbg', '229344', 'i386', 'debug', 'extra', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(702, 'libaprutil1-dev', '572396', 'i386', 'libdevel', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(703, 'libaprutil1-ldap', '25070', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(704, 'libaprutil1', '85074', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.9+dfsg-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(705, 'libapr1-dbg', '57738', 'i386', 'debug', 'extra', 'Debian Apache Maintainers ', '1.3.8-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(706, 'libapr1-dev', '871396', 'i386', 'libdevel', 'optional', 'Debian Apache Maintainers ', '1.3.8-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(707, 'libapr1', '117770', 'i386', 'libs', 'optional', 'Debian Apache Maintainers ', '1.3.8-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(708, 'aprsd', '146856', 'i386', 'hamradio', 'optional', 'Debian Hamradio Maintainers ', '1:2.2.5-13-5.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(709, 'aprsdigi', '42740', 'i386', 'hamradio', 'optional', 'Debian Hamradio Maintainers ', '2.4.4-3.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(710, 'apsfilter', '438510', 'all', 'text', 'extra', 'Pawel Wiecek ', '7.2.6-1.3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(711, 'apt-build', '36316', 'i386', 'devel', 'optional', 'Julien Danjou ', '0.12.37');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(712, 'apt-cacher-ng', '278574', 'i386', 'net', 'optional', 'Eduard Bloch ', '0.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(713, 'apt-cacher', '78792', 'all', 'net', 'optional', 'Mark Hindley ', '1.6.9');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(714, 'apt-cross', '24220', 'all', 'utils', 'extra', 'Neil Williams ', '0.13.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(715, 'libcache-apt-perl', '32968', 'all', 'perl', 'extra', 'Neil Williams ', '0.13.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(716, 'apt-dater-dbg', '68014', 'i386', 'debug', 'extra', 'Patrick MatthÃ¤i ', '0.8.0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(717, 'apt-dater-host', '8832', 'all', 'admin', 'optional', 'Patrick MatthÃ¤i ', '0.8.0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(718, 'apt-dater', '58210', 'i386', 'admin', 'optional', 'Patrick MatthÃ¤i ', '0.8.0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(719, 'apt-dpkg-ref', '96466', 'all', 'doc', 'optional', 'Vanessa GutiÃ©rrez ', '5.3+nmu1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(720, 'apt-file', '29228', 'all', 'admin', 'optional', 'Stefan Fritsch ', '2.3.0');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(721, 'apt-forktracer', '23308', 'all', 'admin', 'optional', 'Marcin Owsiany ', '0.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(722, 'apt-listbugs', '99550', 'all', 'admin', 'optional', 'Ryan Niebur ', '0.1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(723, 'apt-listchanges', '80254', 'all', 'utils', 'standard', 'Pierre Habouzit ', '2.83+nmu1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(724, 'apt-mirror', '11866', 'all', 'net', 'optional', 'Brandon Holtsclaw ', '0.4.5-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(725, 'apt-move', '51334', 'i386', 'admin', 'optional', 'Chuan-kai Lin ', '4.2.27-1+b7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(726, 'apt-offline', '52758', 'all', 'admin', 'optional', 'Ritesh Raj Sarraf ', '0.9.5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(727, 'apt-p2p', '108498', 'all', 'net', 'optional', 'Cameron Dale ', '0.1.5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(728, 'apt-rdepends', '14396', 'all', 'utils', 'optional', 'Simon Law ', '1.3.0-1.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(729, 'apt-show-source', '17968', 'all', 'admin', 'optional', 'OHURA Makoto ', '0.10');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(730, 'apt-show-versions', '33644', 'all', 'admin', 'optional', 'Christoph Martin ', '0.16');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(731, 'apt-spy', '31650', 'i386', 'admin', 'optional', 'Stefano Canepa ', '3.1-19');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(732, 'apt-src', '36352', 'all', 'admin', 'optional', 'Laszlo Boszormenyi (GCS) ', '0.25.1-0.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(733, 'apt-transport-debtorrent', '25660', 'i386', 'admin', 'optional', 'Cameron Dale ', '0.2.1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(734, 'apt-watch-backend', '39282', 'i386', 'admin', 'optional', 'John Lightsey ', '0.3.2-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(735, 'apt-watch-gnome', '36736', 'i386', 'admin', 'optional', 'John Lightsey ', '0.3.2-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(736, 'apt-watch', '3958', 'all', 'admin', 'optional', 'John Lightsey ', '0.3.2-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(737, 'apt-xapian-index', '35730', 'all', 'admin', 'optional', 'Enrico Zini ', '0.22');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(738, 'apt-zip', '20598', 'all', 'admin', 'extra', 'Giacomo Catenazzi ', '0.18');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(739, 'apt-doc', '103962', 'all', 'doc', 'optional', 'APT Development Team ', '0.7.23.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(740, 'apt-transport-https', '62846', 'i386', 'admin', 'optional', 'APT Development Team ', '0.7.23.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(741, 'apt-utils', '193054', 'i386', 'admin', 'important', 'APT Development Team ', '0.7.23.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(742, 'apt', '1641588', 'i386', 'admin', 'important', 'APT Development Team ', '0.7.23.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(743, 'libapt-pkg-dev', '115234', 'i386', 'libdevel', 'optional', 'APT Development Team ', '0.7.23.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(744, 'libapt-pkg-doc', '128344', 'all', 'doc', 'optional', 'APT Development Team ', '0.7.23.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(745, 'aptfs', '8322', 'all', 'utils', 'extra', 'Chris Lamb ', '0.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(746, 'apticron', '17046', 'all', 'admin', 'extra', 'Tiago Bortoletto Vaz ', '1.1.37');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(747, 'aptitude-dbg', '5912136', 'i386', 'debug', 'extra', 'Daniel Burrows ', '0.4.11.11-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(748, 'aptitude-doc-cs', '379426', 'all', 'doc', 'optional', 'Daniel Burrows ', '0.4.11.11-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(749, 'aptitude-doc-en', '364786', 'all', 'doc', 'optional', 'Daniel Burrows ', '0.4.11.11-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(750, 'aptitude-doc-fi', '271986', 'all', 'doc', 'optional', 'Daniel Burrows ', '0.4.11.11-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(751, 'aptitude-doc-fr', '312104', 'all', 'doc', 'optional', 'Daniel Burrows ', '0.4.11.11-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(752, 'aptitude-doc-ja', '374740', 'all', 'doc', 'optional', 'Daniel Burrows ', '0.4.11.11-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(753, 'aptitude', '3034330', 'i386', 'admin', 'important', 'Daniel Burrows ', '0.4.11.11-1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(754, 'aptlinex', '17902', 'all', 'utils', 'optional', 'JosÃ© L. Redrejo RodrÃ­guez ', '0.91-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(755, 'aptoncd', '268724', 'all', 'admin', 'extra', 'Fabrice Coutadeur ', '0.1.98+bzr112-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(756, 'aptsh', '61702', 'i386', 'admin', 'optional', 'Marcin Wrochniak ', '0.0.7+nmu1+b2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(757, 'apvlv', '113304', 'i386', 'text', 'extra', 'Stefan Ritter ', '0.0.7.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(758, 'apwal', '63526', 'i386', 'gnome', 'optional', 'Sam Hocevar (Debian packages) ', '0.4.5-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(759, 'aqemu', '1327580', 'i386', 'x11', 'optional', 'Ignace Mouzannar ', '0.7.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(760, 'aqsis-libs-dev', '30742', 'i386', 'libdevel', 'optional', 'David MartÃ­nez Moreno ', '1.2.0-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(761, 'aqsis-libsc2a', '1535952', 'i386', 'libs', 'optional', 'David MartÃ­nez Moreno ', '1.2.0-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(762, 'aqsis', '335492', 'i386', 'graphics', 'optional', 'David MartÃ­nez Moreno ', '1.2.0-2.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(763, 'aqualung', '861368', 'i386', 'sound', 'extra', 'Adam CÃ©cile (Le_Vert) ', '0.9~beta10-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(764, 'ara', '293464', 'i386', 'utils', 'optional', 'George Danchev ', '1.0.27');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(765, 'xara-gtk', '630916', 'i386', 'utils', 'optional', 'George Danchev ', '1.0.27');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(766, 'arandr', '31038', 'all', 'x11', 'optional', 'Christian M. AmsÃ¼ss ', '0.1.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(767, 'aranym', '1712610', 'i386', 'otherosfs', 'extra', 'Antonin Kral ', '0.9.9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(768, 'arc-brave', '412746', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(769, 'arc-colors', '11472', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(770, 'arc-dust', '396076', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(771, 'arc-human', '393178', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(772, 'arc-illustrious', '383736', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(773, 'arc-noble', '406046', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(774, 'arc-wine', '353836', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(775, 'arc-wise', '408718', 'all', 'gnome', 'optional', 'GNOME-Colors Packagers ', '2.7-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(776, 'arc', '56466', 'i386', 'utils', 'optional', 'Klaus Reimer ', '5.21o-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(777, 'arch-buildpackage', '9770', 'all', 'vcs', 'optional', 'Debian QA Group ', '0.1-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(778, 'libarch-perl', '161792', 'all', 'perl', 'optional', 'Debian QA Group ', '0.5.1+patch-180-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(779, 'arch2darcs', '276492', 'i386', 'vcs', 'optional', 'John Goerzen ', '1.0.13');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(780, 'archfs', '23322', 'i386', 'utils', 'optional', 'Jon Dowland ', '0.5.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(781, 'archivemail', '37604', 'all', 'mail', 'optional', 'Serafeim Zanikolas ', '0.7.2-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(782, 'archmage', '28980', 'all', 'utils', 'optional', 'Mikhail Gusarov ', '1:0.2.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(783, 'archmbox', '37032', 'all', 'mail', 'optional', 'Debian QA Group ', '4.10.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(784, 'archway', '302342', 'all', 'vcs', 'optional', 'Debian QA Group ', '0.2.1+patch-85-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(785, 'archzoom', '116252', 'all', 'vcs', 'optional', 'Debian QA Group ', '0.5.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(786, 'ardour-i686', '4545294', 'i386', 'sound', 'optional', 'Debian Multimedia Team ', '1:2.8-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(787, 'ardour', '4505602', 'i386', 'sound', 'optional', 'Debian Multimedia Team ', '1:2.8-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(788, 'arename', '57244', 'all', 'sound', 'optional', 'Maximilian Gass ', '3.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(789, 'python-argparse-doc', '55208', 'all', 'doc', 'optional', 'Ritesh Raj Sarraf ', '1.0.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(790, 'python-argparse', '41448', 'all', 'python', 'optional', 'Ritesh Raj Sarraf ', '1.0.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(791, 'libargtable2-0', '13240', 'i386', 'libs', 'optional', 'Shachar Shemesh ', '9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(792, 'libargtable2-dev', '39330', 'i386', 'libdevel', 'optional', 'Shachar Shemesh ', '9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(793, 'libargtable2-docs', '2963174', 'all', 'doc', 'optional', 'Shachar Shemesh ', '9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(794, 'argus-client', '1832450', 'i386', 'net', 'optional', 'Andrew Pollock ', '2.0.6.fixes.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(795, 'argus-server', '136840', 'i386', 'net', 'optional', 'Andrew Pollock ', '1:2.0.6.fixes.1-16');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(796, 'python-argvalidate', '29416', 'all', 'python', 'optional', 'Debian Python Modules Team ', '0.9.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(797, 'argyll', '3842422', 'i386', 'graphics', 'optional', 'Roland Mas ', '1.0.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(798, 'aria2', '1564914', 'i386', 'net', 'optional', 'Patrick Ruckstuhl ', '1.6.2-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(799, 'aribas', '195626', 'i386', 'math', 'optional', 'Ralf Treinen ', '1.63-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(800, 'ario-common', '308240', 'all', 'sound', 'optional', 'Marc Pavot ', '1.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(801, 'ario', '196178', 'i386', 'sound', 'optional', 'Marc Pavot ', '1.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(802, 'arista', '196594', 'all', 'video', 'optional', 'Alessio Treglia ', '0.9.3-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(803, 'arj', '218886', 'i386', 'utils', 'optional', 'Guillem Jover ', '3.10.22-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(804, 'libarmadillo-dev', '115596', 'i386', 'libdevel', 'optional', 'Debian Science Maintainers ', '0.6.12-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(805, 'libarmadillo-doc', '1662932', 'all', 'doc', 'optional', 'Debian Science Maintainers ', '0.6.12-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(806, 'libarmadillo0', '7594', 'i386', 'libs', 'optional', 'Debian Science Maintainers ', '0.6.12-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(807, 'armagetronad-common', '552728', 'all', 'games', 'optional', 'Christine Spang ', '0.2.8.3~rc3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(808, 'armagetronad-dedicated', '811432', 'i386', 'games', 'optional', 'Christine Spang ', '0.2.8.3~rc3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(809, 'armagetronad', '1358740', 'i386', 'games', 'optional', 'Christine Spang ', '0.2.8.3~rc3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(810, 'arno-iptables-firewall', '123450', 'all', 'net', 'optional', 'Michael Hanke ', '1.9.2.d-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(811, 'arora', '1462620', 'i386', 'web', 'extra', 'Sune Vuorela ', '0.10.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(812, 'arp-scan', '181664', 'i386', 'admin', 'extra', 'Tim Brown ', '1.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(813, 'libarpack++2-dev', '464752', 'i386', 'libdevel', 'optional', 'Debian Scientific Computing Team ', '2.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(814, 'libarpack++2c2a', '11234', 'i386', 'libs', 'optional', 'Debian Scientific Computing Team ', '2.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(815, 'libarpack2-dbg', '21126', 'i386', 'debug', 'extra', 'Debian Scientific Computing Team ', '2.1+parpack96.dfsg-2+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(816, 'libarpack2-dev', '664704', 'i386', 'libdevel', 'extra', 'Debian Scientific Computing Team ', '2.1+parpack96.dfsg-2+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(817, 'libarpack2', '240638', 'i386', 'libs', 'optional', 'Debian Scientific Computing Team ', '2.1+parpack96.dfsg-2+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(818, 'arpalert', '512538', 'i386', 'net', 'optional', 'Jan Wagner ', '2.0.11-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(819, 'arping', '23368', 'i386', 'net', 'optional', 'Giuseppe Iuculano ', '2.08-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(820, 'arpon', '255652', 'i386', 'net', 'optional', 'Giuseppe Iuculano ', '1.90-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(821, 'arptables', '32302', 'i386', 'net', 'optional', 'Jochen Friedrich ', '0.0.3.3-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(822, 'arpwatch', '184644', 'i386', 'admin', 'optional', 'KELEMEN PÃ©ter ', '2.1a15-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(823, 'array-info', '18040', 'i386', 'admin', 'optional', 'Raphael Pinson ', '0.15-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(824, 'arrayprobe', '9362', 'i386', 'admin', 'extra', 'Matt Taggart ', '2.0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(825, 'artha', '62580', 'i386', 'utils', 'optional', 'Debian Science Team ', '0.9.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(826, 'artist', '50518', 'all', 'utils', 'optional', 'Fredrik Hallenberg ', '1.2.6-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(827, 'arts-dbg', '3142826', 'i386', 'debug', 'extra', 'Debian Qt/KDE Maintainers ', '1.5.9-3+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(828, 'arts', '6438', 'all', 'sound', 'optional', 'Debian Qt/KDE Maintainers ', '1.5.9-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(829, 'libarts1-dev', '1141326', 'i386', 'libdevel', 'optional', 'Debian Qt/KDE Maintainers ', '1.5.9-3+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(830, 'libarts1c2a', '1088354', 'i386', 'libs', 'optional', 'Debian Qt/KDE Maintainers ', '1.5.9-3+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(831, 'libartsc0-dev', '21766', 'i386', 'libdevel', 'optional', 'Debian Qt/KDE Maintainers ', '1.5.9-3+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(832, 'libartsc0', '15826', 'i386', 'libs', 'optional', 'Debian Qt/KDE Maintainers ', '1.5.9-3+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(833, 'as31', '24556', 'i386', 'devel', 'optional', 'Bdale Garbee ', '2.3.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(834, 'asc-music', '10396276', 'all', 'games', 'optional', 'Debian Games Team ', '1.3-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(835, 'asc-data', '14349590', 'all', 'games', 'optional', 'Debian Games Team ', '2.1.0.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(836, 'asc', '3371690', 'i386', 'games', 'optional', 'Debian Games Team ', '2.1.0.0-2+b1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(837, 'ascd', '188170', 'i386', 'sound', 'optional', 'Fredrik Hallenberg ', '0.13.2-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(838, 'ascdc', '20208', 'i386', 'sound', 'optional', 'Fredrik Hallenberg ', '0.3-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(839, 'ascii', '16064', 'i386', 'utils', 'optional', 'Florian Ernst ', '3.8-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(840, 'ascii2binary', '19616', 'i386', 'misc', 'optional', 'Mohammed Sameer ', '2.13-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(841, 'asciidoc', '1610058', 'all', 'text', 'optional', 'Fredrik Steen ', '8.5.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(842, 'asciijump', '27576', 'i386', 'games', 'optional', 'Mario Iseli ', '0.0.6-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(843, 'asclock-themes', '248338', 'all', 'x11', 'optional', 'Helge Kreutzmann ', '2.0.12-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(844, 'asclock', '29692', 'i386', 'x11', 'optional', 'Helge Kreutzmann ', '2.0.12-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(845, 'libasedrive-serial', '29088', 'i386', 'libs', 'optional', 'Ludovic Rousseau ', '3.5-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(846, 'libasedrive-usb', '27594', 'i386', 'libs', 'optional', 'Ludovic Rousseau ', '3.5-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(847, 'libasio-dev', '222968', 'all', 'libdevel', 'optional', 'Simon Richter ', '1.4.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(848, 'libasio-doc', '909876', 'all', 'doc', 'optional', 'Simon Richter ', '1.4.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(849, 'asis-programs', '770774', 'i386', 'devel', 'optional', 'Ludovic Brenta ', '2007-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(850, 'libasis-dev', '3988118', 'i386', 'libdevel', 'optional', 'Ludovic Brenta ', '2007-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(851, 'libasis2007.1-dbg', '1146748', 'i386', 'debug', 'extra', 'Ludovic Brenta ', '2007-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(852, 'libasis2007.1', '633676', 'i386', 'libs', 'optional', 'Ludovic Brenta ', '2007-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(853, 'libasm-java-doc', '267530', 'all', 'doc', 'optional', 'Debian Java Maintainers ', '1.5.3-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(854, 'libasm-java', '159448', 'all', 'java', 'optional', 'Debian Java Maintainers ', '1.5.3-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(855, 'libasm2-java-doc', '343426', 'all', 'doc', 'optional', 'Debian Java Maintainers ', '2.2.3-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(856, 'libasm2-java', '163256', 'all', 'java', 'optional', 'Debian Java Maintainers ', '2.2.3-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(857, 'libasm3-java-doc', '610038', 'all', 'doc', 'optional', 'Debian Java Maintainers ', '3.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(858, 'libasm3-java', '195756', 'all', 'java', 'optional', 'Debian Java Maintainers ', '3.2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(859, 'asmail', '219720', 'i386', 'mail', 'optional', 'Fredrik Hallenberg ', '2.1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(860, 'asmix', '17100', 'i386', 'x11', 'optional', 'Varun Hiremath ', '1.5-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(861, 'asmixer', '11974', 'i386', 'sound', 'optional', 'Fredrik Hallenberg ', '0.5-14');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(862, 'asmon', '16212', 'i386', 'x11', 'optional', 'Eric Evans ', '0.71-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(863, 'asn1-mode', '94148', 'all', 'editors', 'optional', 'W. Martin Borgert ', '2.7-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(864, 'asn1c', '471722', 'i386', 'devel', 'optional', 'W. Martin Borgert ', '0.9.21.dfsg-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(865, 'asp', '18096', 'i386', 'net', 'extra', 'Roland Stigge ', '1.8-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(866, 'aspectc++', '655562', 'i386', 'devel', 'optional', 'Reinhard Tartler ', '1.0pre4~svn.20090918-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(867, 'libpuma-dev', '1423600', 'i386', 'libdevel', 'optional', 'Reinhard Tartler ', '1.0pre4~svn.20090918-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(868, 'libpuma-doc', '2014940', 'all', 'doc', 'optional', 'Reinhard Tartler ', '1.0pre4~svn.20090918-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(869, 'aspectj-doc', '648950', 'all', 'doc', 'optional', 'Debian Java maintainers ', '1.6.6+dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(870, 'aspectj', '10754940', 'all', 'java', 'optional', 'Debian Java maintainers ', '1.6.6+dfsg-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(871, 'libaspectwerkz2-java', '645464', 'all', 'java', 'optional', 'Debian Java Maintainers ', '2.0.dfsg.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(872, 'aspell-am', '46948', 'all', 'text', 'optional', 'Lior Kaplan ', '0.03-1-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(873, 'aspell-ar-large', '2225022', 'all', 'text', 'optional', 'Debian Arabic Packaging Team ', '1.2-0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(874, 'aspell-ar', '107196', 'all', 'text', 'optional', 'Debian Arabic Packaging Team ', '0.0.20060329-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(875, 'aspell-bn', '149640', 'all', 'text', 'optional', 'Debian-IN Team ', '0.60.0.01.1.1-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(876, 'aspell-br', '66216', 'all', 'text', 'optional', 'Brian Nelson ', '0.50-2-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(877, 'aspell-cs', '560960', 'all', 'text', 'optional', 'Miroslav Kure ', '0.0.20040614.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(878, 'aspell-cy', '157024', 'all', 'text', 'optional', 'Brian Nelson ', '0.50-3-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(879, 'aspell-el', '434228', 'all', 'text', 'optional', 'Brian Nelson ', '0.50-3-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(880, 'aspell-en', '249438', 'all', 'text', 'optional', 'Brian Nelson ', '6.0-0-5.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(881, 'aspell-fa', '199008', 'all', 'text', 'optional', 'Debian Arabic Packaging Team ', '0.11-0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(882, 'aspell-fr', '376504', 'all', 'text', 'optional', 'Remi Vanicat ', '0.50-3-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(883, 'aspell-ga', '322040', 'all', 'text', 'optional', 'Brian Nelson ', '0.50-4-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(884, 'aspell-gu', '204932', 'all', 'text', 'optional', 'Debian-IN Team ', '0.03-0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(885, 'aspell-he', '189670', 'all', 'text', 'optional', 'Debian Hebrew Packaging Team ', '1.0-0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(886, 'aspell-hi', '215236', 'all', 'text', 'optional', 'Debian-IN Team ', '0.02-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(887, 'aspell-hr', '282274', 'all', 'text', 'optional', 'Vedran FuraÄ ', '0.51-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(888, 'aspell-hu', '530214', 'all', 'text', 'optional', 'Balint Kozman ', '0.99.4.2-0-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(889, 'aspell-hy', '252028', 'all', 'text', 'optional', 'Alan Baghumian ', '0.10.0-0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(890, 'aspell-is', '404330', 'all', 'text', 'optional', 'Brian Nelson ', '0.51-0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(891, 'aspell-it', '1053960', 'all', 'text', 'optional', 'Giuseppe Iuculano ', '2.4-20070901-0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(892, 'aspell-ku', '18800', 'all', 'text', 'optional', 'Debian Arabic Packaging Team ', '0.20-0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(893, 'aspell-ml', '588132', 'all', 'text', 'optional', 'Debian-IN Team ', '0.04-1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(894, 'aspell-mr', '188512', 'all', 'text', 'optional', 'Debian-IN Team ', '0.10-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(895, 'aspell-or', '16000', 'all', 'text', 'optional', 'Debian-IN Team ', '0.03-1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(896, 'aspell-pa', '18922', 'all', 'text', 'optional', 'Debian-IN Team ', '0.01-1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(897, 'aspell-pl', '703062', 'all', 'text', 'optional', 'Krzysztof KrzyÅ¼aniak (eloy) ', '20090804-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(898, 'aspell-pt', '3592', 'all', 'text', 'optional', 'Agustin Martin Domingo ', '1.5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(899, 'aspell-ro', '508972', 'all', 'text', 'optional', 'Eddy PetriÈ™or ', '3.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(900, 'aspell-sk', '525190', 'all', 'text', 'optional', 'Brian Nelson ', '0.52-0-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(901, 'aspell-sl', '563426', 'all', 'text', 'optional', 'Jure Cuhalev ', '0.60-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(902, 'aspell-sv', '110910', 'all', 'text', 'optional', 'Magnus Holmgren ', '0.51-0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(903, 'aspell-ta', '48824', 'all', 'text', 'optional', 'Debian-IN Team ', '0.01-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(904, 'aspell-te', '407114', 'all', 'text', 'optional', 'Debian-IN Team ', '0.01-2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(905, 'aspell-tl', '48494', 'all', 'text', 'optional', 'Agustin Martin Domingo ', '0.4-0-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(906, 'myspell-tl', '61134', 'all', 'text', 'optional', 'Agustin Martin Domingo ', '0.4-0-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(907, 'aspell-uz', '119626', 'all', 'text', 'optional', 'Mashrab Kuvatov ', '0.6.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(908, 'aspell-doc', '304546', 'all', 'doc', 'optional', 'Brian Nelson ', '0.60.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(909, 'aspell', '289892', 'i386', 'text', 'optional', 'Brian Nelson ', '0.60.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(910, 'libaspell-dev', '50066', 'i386', 'libdevel', 'optional', 'Brian Nelson ', '0.60.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(911, 'libaspell15', '607500', 'i386', 'libs', 'optional', 'Brian Nelson ', '0.60.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(912, 'libpspell-dev', '46544', 'i386', 'libdevel', 'optional', 'Brian Nelson ', '0.60.6-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(913, 'aspell-pt-pt', '118728', 'all', 'text', 'optional', 'Agustin Martin Domingo ', '20090309.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(914, 'asql', '16550', 'all', 'admin', 'optional', 'Steve Kemp ', '1.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(915, 'asr-manpages', '21866', 'all', 'doc', 'optional', 'Pawel Wiecek ', '1.3-6');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(916, 'assogiate', '202710', 'i386', 'utils', 'optional', 'Vincent Legout ', '0.2.1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(917, 'asterisk-chan-capi', '118966', 'i386', 'comm', 'optional', 'Debian VoIP Team ', '1.1.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(918, 'asterisk-prompt-de', '1448930', 'all', 'comm', 'extra', 'Mario Joussen ', '2.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(919, 'asterisk-prompt-es-co', '1002364', 'all', 'comm', 'extra', 'Diego AndrÃ©s Asenjo GonzÃ¡lez ', '0.20070403-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(920, 'asterisk-prompt-fr-armelle', '1505024', 'all', 'comm', 'extra', 'Debian VoIP team ', '20070613-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(921, 'asterisk-prompt-fr-proformatique', '11886550', 'all', 'comm', 'extra', 'Debian VoIP team ', '20070706-1.4-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(922, 'asterisk-prompt-it', '1889428', 'all', 'comm', 'extra', 'Debian VoIP Team ', '20060510-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(923, 'asterisk-prompt-se', '4195926', 'all', 'comm', 'extra', 'Simon Richter ', '1.045-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(924, 'asterisk-sounds-extra', '3419310', 'all', 'comm', 'optional', 'Debian VoIP Team ', '1.4.9-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(925, 'asterisk-config', '601162', 'all', 'comm', 'optional', 'Debian VoIP Team ', '1:1.6.2.0~dfsg~rc1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(926, 'asterisk-dbg', '21247064', 'i386', 'debug', 'extra', 'Debian VoIP Team ', '1:1.6.2.0~dfsg~rc1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(927, 'asterisk-dev', '532718', 'all', 'devel', 'extra', 'Debian VoIP Team ', '1:1.6.2.0~dfsg~rc1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(928, 'asterisk-doc', '1619684', 'all', 'doc', 'extra', 'Debian VoIP Team ', '1:1.6.2.0~dfsg~rc1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(929, 'asterisk-h323', '427472', 'i386', 'comm', 'optional', 'Debian VoIP Team ', '1:1.6.2.0~dfsg~rc1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(930, 'asterisk-sounds-main', '2042140', 'all', 'comm', 'optional', 'Debian VoIP Team ', '1:1.6.2.0~dfsg~rc1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(931, 'asterisk', '3364074', 'i386', 'comm', 'optional', 'Debian VoIP Team ', '1:1.6.2.0~dfsg~rc1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(932, 'astronomical-almanac', '258578', 'i386', 'science', 'optional', 'James R. Van Zandt ', '5.6-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(933, 'astyle', '129620', 'i386', 'devel', 'optional', 'Margarita Manterola ', '1.23-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(934, 'asunder', '92232', 'i386', 'sound', 'optional', 'Jens Peter Secher ', '1.6.2-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(935, 'asused', '84176', 'all', 'utils', 'optional', 'Jan Wagner ', '3.72-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(936, 'aswiki', '34028', 'all', 'web', 'optional', 'TANIGUCHI Takaki ', '1.0.4-10');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(937, 'asylum-data', '318852', 'all', 'games', 'optional', 'Debian Games Team ', '0.3.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(938, 'asylum', '57614', 'i386', 'games', 'optional', 'Debian Games Team ', '0.3.2-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(939, 'asymptote-doc', '4522868', 'all', 'doc', 'optional', 'Hubert Chathi ', '1.88-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(940, 'asymptote', '1808440', 'i386', 'tex', 'optional', 'Hubert Chathi ', '1.88-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(941, 'at-spi-doc', '182410', 'all', 'doc', 'optional', 'Debian GNOME Maintainers ', '1.28.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(942, 'at-spi', '233422', 'i386', 'gnome', 'optional', 'Debian GNOME Maintainers ', '1.28.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(943, 'libatspi-dbg', '529604', 'i386', 'debug', 'extra', 'Debian GNOME Maintainers ', '1.28.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(944, 'libatspi-dev', '163060', 'i386', 'libdevel', 'optional', 'Debian GNOME Maintainers ', '1.28.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(945, 'libatspi1.0-0', '223150', 'i386', 'libs', 'optional', 'Debian GNOME Maintainers ', '1.28.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(946, 'python-pyatspi', '123786', 'all', 'python', 'optional', 'Debian GNOME Maintainers ', '1.28.1-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(947, 'at', '44382', 'i386', 'admin', 'standard', 'Ansgar Burchardt ', '3.1.11-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(948, 'atanks-data', '1284390', 'all', 'games', 'optional', 'Mark Purcell ', '3.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(949, 'atanks', '169006', 'i386', 'games', 'optional', 'Mark Purcell ', '3.6-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(950, 'aterm-ml', '265372', 'i386', 'x11', 'optional', 'Debian QA Group ', '1.0.1-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(951, 'aterm', '84760', 'i386', 'x11', 'optional', 'Debian QA Group ', '1.0.1-7');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(952, 'atftp', '28842', 'i386', 'net', 'extra', 'Ludovic Drolez ', '0.7.dfsg-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(953, 'atftpd', '59160', 'i386', 'net', 'extra', 'Ludovic Drolez ', '0.7.dfsg-8');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(954, 'athcool', '16120', 'i386', 'misc', 'extra', 'Nicolas Boullis ', '0.3.12-3');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(955, 'atheist', '158566', 'all', 'devel', 'optional', 'Cleto Martin Angelina ', '0.20090921-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(956, 'atheme-services', '617076', 'i386', 'net', 'optional', 'Debian IRC Team ', '3.0.4-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(957, 'athena-jot', '9876', 'i386', 'utils', 'optional', 'Francesco Paolo Lovergine ', '9.0-5');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(958, 'atitvout', '20794', 'i386', 'misc', 'optional', 'Philippe Coval ', '0.4-13');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(959, 'libatk1.0-0', '81452', 'i386', 'libs', 'optional', 'Debian GNOME Maintainers ', '1.28.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(960, 'libatk1.0-data', '208678', 'all', 'misc', 'optional', 'Debian GNOME Maintainers ', '1.28.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(961, 'libatk1.0-dbg', '142430', 'i386', 'debug', 'extra', 'Debian GNOME Maintainers ', '1.28.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(962, 'libatk1.0-dev', '117526', 'i386', 'libdevel', 'optional', 'Debian GNOME Maintainers ', '1.28.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(963, 'libatk1.0-doc', '142006', 'all', 'doc', 'optional', 'Debian GNOME Maintainers ', '1.28.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(964, 'libatlas-cpp-0.6-1-dbg', '1093064', 'i386', 'debug', 'extra', 'Michael Koch ', '0.6.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(965, 'libatlas-cpp-0.6-1', '198094', 'i386', 'libs', 'optional', 'Michael Koch ', '0.6.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(966, 'libatlas-cpp-0.6-dev', '53676', 'i386', 'libdevel', 'optional', 'Michael Koch ', '0.6.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(967, 'libatlas-cpp-doc', '1363782', 'all', 'doc', 'optional', 'Michael Koch ', '0.6.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(968, 'libatlas-3dnow-dev', '6224982', 'i386', 'devel', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(969, 'libatlas-base-dev', '5754786', 'i386', 'devel', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(970, 'libatlas-doc', '683292', 'all', 'doc', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(971, 'libatlas-headers', '21590', 'all', 'devel', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(972, 'libatlas-sse-dev', '5849124', 'i386', 'devel', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(973, 'libatlas-sse2-dev', '6509440', 'i386', 'devel', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(974, 'libatlas-test', '572188', 'i386', 'devel', 'extra', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(975, 'libatlas3gf-3dnow', '5487668', 'i386', 'libs', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(976, 'libatlas3gf-base', '5159058', 'i386', 'libs', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(977, 'libatlas3gf-sse2', '5712514', 'i386', 'libs', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(978, 'libatlas3gf-sse', '5098246', 'i386', 'libs', 'optional', 'Debian Scientific Computing Team ', '3.6.0-24');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(979, 'atlc-examples', '1059782', 'all', 'electronics', 'optional', 'Bdale Garbee ', '4.6.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(980, 'atlc', '1253480', 'i386', 'electronics', 'optional', 'Bdale Garbee ', '4.6.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(981, 'atom4', '48456', 'i386', 'games', 'optional', 'Hwei Sheng Teoh ', '4.1-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(982, 'atomicparsley', '110918', 'i386', 'video', 'optional', 'Jonas Smedegaard ', '0.9.2~svn110-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(983, 'atomix-data', '109554', 'all', 'games', 'optional', 'Guilherme de S. Pastore ', '2.14.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(984, 'atomix', '51042', 'i386', 'games', 'optional', 'Guilherme de S. Pastore ', '2.14.0-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(985, 'atool', '44266', 'all', 'utils', 'optional', 'Francois Marier ', '0.37.0-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(986, 'atop', '78122', 'i386', 'admin', 'optional', 'Edelhard Becker ', '1.23-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(987, 'kernel-patch-atopacct', '18206', 'all', 'kernel', 'optional', 'Edelhard Becker ', '1:1.23-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(988, 'kernel-patch-atopcnt', '22784', 'all', 'kernel', 'optional', 'Edelhard Becker ', '1:1.23-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(989, 'atp', '25674', 'i386', 'text', 'optional', 'Hamish Moffatt ', '1.2-11');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(990, 'atris', '319278', 'i386', 'games', 'optional', 'Pascal Giard ', '1.0.7.dfsg.1-7.1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(991, 'atsar', '40964', 'i386', 'admin', 'optional', 'Michael Stone ', '1.7-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(992, 'attal-themes-medieval', '34768600', 'all', 'games', 'optional', 'Debian Games Team ', '1.0~rc2.dfsg1-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(993, 'attal', '1113180', 'i386', 'games', 'optional', 'Debian Games Team ', '1.0~rc2-2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(994, 'attr', '45072', 'i386', 'utils', 'optional', 'Nathan Scott ', '1:2.4.44-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(995, 'libattr1-dev', '34454', 'i386', 'libdevel', 'extra', 'Nathan Scott ', '1:2.4.44-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(996, 'libattr1', '11846', 'i386', 'libs', 'required', 'Nathan Scott ', '1:2.4.44-1');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(997, 'aub', '60308', 'all', 'news', 'optional', 'Debian QA Group ', '2.2.2');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(998, 'aubio-tools', '30600', 'i386', 'sound', 'optional', 'Paul Brossier ', '0.3.2-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(999, 'libaubio-dev', '68364', 'i386', 'libdevel', 'optional', 'Paul Brossier ', '0.3.2-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(1000, 'libaubio-doc', '286504', 'all', 'doc', 'optional', 'Paul Brossier ', '0.3.2-4');
INSERT INTO packages_plain (id, package, size, architecture, section, priority, maintainer, version) VALUES(26595, 'Some package 2', '', '', '', '', 'Some man', 'Some version');

-- --------------------------------------------------------

--
-- Table structure for table 'packages_tree'
--
DROP TABLE IF EXISTS packages_tree;
CREATE TABLE IF NOT EXISTS packages_tree (
  id int(11) NOT NULL AUTO_INCREMENT,
  parent_id int(11) DEFAULT NULL,
  `value` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  state varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  hours int(11) DEFAULT NULL,
  has_kids int(11) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=7 ;

--
-- Dumping data for table 'packages_tree'
--

INSERT INTO packages_tree (id, parent_id, value, state, hours, has_kids) VALUES(1, 0, 'Layout branch', 'in progress', 120, 1);
INSERT INTO packages_tree (id, parent_id, value, state, hours, has_kids) VALUES(2, 0, 'Data branch', 'in progress', 150, 1);
INSERT INTO packages_tree (id, parent_id, value, state, hours, has_kids) VALUES(3, 1, 'Accordion', 'finalized', 42, 0);
INSERT INTO packages_tree (id, parent_id, value, state, hours, has_kids) VALUES(4, 1, 'Multiview', 'finalized', 34, 0);
INSERT INTO packages_tree (id, parent_id, value, state, hours, has_kids) VALUES(5, 2, 'List', 'finalized', 50, 0);
INSERT INTO packages_tree (id, parent_id, value, state, hours, has_kids) VALUES(6, 0, 'Calendar', 'planing', 0, 0);




-- --------------------------------------------------------

--
-- Table structure for table `events`
--
DROP TABLE `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(127) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `details` text NOT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1261152023 ;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `event_name`, `start_date`, `end_date`, `details`) VALUES
(2, 'French Open', '2014-05-24 00:00:00', '2014-06-08 00:00:00', 'Details for French Open'),
(3, 'Aegon Championship', '2014-06-10 00:00:00', '2014-06-13 00:00:00', 'Details for Aegon Championship'),
(4, 'Wimbledon', '2014-06-21 00:00:00', '2014-07-05 00:00:00', 'Details for Wimbledon'),
(5, 'Indianapolis Tennis Championships', '2014-07-18 00:00:00', '2014-07-27 00:00:00', 'Details for Indianapolis Tennis Championships'),
(8, 'Countrywide Classic Tennis', '2014-07-27 00:00:00', '2014-08-02 00:00:00', 'Details for Countrywide Classic Tennis'),
(7, 'ATP Master Tennis', '2014-05-11 00:00:00', '2014-05-18 00:00:00', 'Details for ATP Master Tennis'),
(9, 'Legg Mason Tennis Classic', '2014-08-01 00:00:00', '2014-08-11 00:00:00', 'Details for Legg Mason Tennis Classic'),
(12, 'US Open Tennis Championship', '2014-08-29 00:00:00', '2014-09-14 00:00:00', 'Details for US Open Tennis Championship'),
(13, 'Barclays ATP World Tour Finals', '2014-11-22 00:00:00', '2014-11-28 00:00:00', 'Details for Barclays ATP World Tour Finals'),
(14, 'Western & Southern Financial Group Masters Tennis', '2014-08-17 00:00:00', '2014-08-24 00:00:00', 'Details for Western & Southern Financial Group Masters Tennis'),
(15, ' Parc Izvor ', '2014-05-16 15:00:00', '2014-05-16 18:00:00', 'Details for  Parc Izvor '),
(16, ' Arena Zagreb ', '2014-05-21 14:00:00', '2014-05-21 17:00:00', 'Details for  Arena Zagreb '),
(17, ' Gwardia Stadium ', '2014-05-23 11:00:00', '2014-05-23 14:00:00', 'Details for  Gwardia Stadium '),
(18, ' Skonto Stadium - Riga ', '2014-05-25 19:00:00', '2014-05-25 22:00:00', 'Details for  Skonto Stadium - Riga '),
(19, ' Zalgirio Stadionas ', '2014-05-27 15:00:00', '2014-05-27 18:00:00', 'Details for  Zalgirio Stadionas '),
(20, ' O2 Dome ', '2014-05-30 17:00:00', '2014-05-30 20:00:00', 'Details for  O2 Dome '),
(21, ' Evenemententerrein Megaland ', '2014-05-31 16:00:00', '2014-05-31 19:00:00', 'Details for  Evenemententerrein Megaland '),
(22, ' HSH Nordbank Arena (formerly AOL Arena) ', '2014-06-02 10:00:00', '2014-06-02 13:00:00', 'Details for  HSH Nordbank Arena (formerly AOL Arena) '),
(23, ' LTU Arena ', '2014-06-04 11:00:00', '2014-06-04 14:00:00', 'Details for  LTU Arena '),
(24, ' LTU Arena ', '2014-06-05 12:00:00', '2014-06-05 15:00:00', 'Details for  LTU Arena '),
(25, ' Zentralstadion - Leipzig ', '2014-06-07 20:00:00', '2014-06-07 23:00:00', 'Details for  Zentralstadion - Leipzig '),
(26, ' Zentralstadion - Leipzig ', '2014-06-08 17:00:00', '2014-06-08 20:00:00', 'Details for  Zentralstadion - Leipzig '),
(27, ' Olympiastadion - Berlin ', '2014-06-10 14:00:00', '2014-06-10 17:00:00', 'Details for  Olympiastadion - Berlin '),
(28, ' Commerz Bank Arena ', '2014-06-12 14:00:00', '2014-06-12 17:00:00', 'Details for  Commerz Bank Arena '),
(29, ' Olympic Stadium - Munich ', '2014-06-13 11:00:00', '2014-06-13 14:00:00', 'Details for  Olympic Stadium - Munich '),
(30, ' Stadio Olimpico ', '2014-06-16 19:00:00', '2014-06-16 22:00:00', 'Details for  Stadio Olimpico '),
(31, ' Comunale Giuseppe Meazza - San Siro ', '2014-06-18 20:00:00', '2014-06-18 23:00:00', 'Details for  Comunale Giuseppe Meazza - San Siro '),
(32, ' Inter Stadion Slovakia ', '2014-06-22 19:00:00', '2014-06-22 22:00:00', 'Details for  Inter Stadion Slovakia '),
(33, ' Puskas Ferenc Stadium ', '2014-06-23 14:00:00', '2014-06-23 17:00:00', 'Details for  Puskas Ferenc Stadium '),
(34, ' Slavia Stadion ', '2014-06-25 10:00:00', '2014-06-25 13:00:00', 'Details for  Slavia Stadion '),
(35, ' Stade de France - Paris ', '2014-06-27 19:00:00', '2014-06-27 22:00:00', 'Details for  Stade de France - Paris '),
(36, ' Parken Stadium ', '2014-06-30 18:00:00', '2014-06-30 21:00:00', 'Details for  Parken Stadium '),
(37, ' Koengen ', '2014-07-02 18:00:00', '2014-07-02 21:00:00', 'Details for  Koengen '),
(38, ' Folkets Park ', '2014-07-03 11:00:00', '2014-07-03 14:00:00', 'Details for  Folkets Park '),
(39, ' Estadio Jose Zorila ', '2014-07-08 18:00:00', '2014-07-08 21:00:00', 'Details for  Estadio Jose Zorila '),
(40, ' Bessa Stadium ', '2014-07-11 10:00:00', '2014-07-11 13:00:00', 'Details for  Bessa Stadium '),
(41, ' Estadio Olimpico - Seville ', '2014-07-12 14:00:00', '2014-07-12 17:00:00', 'Details for  Estadio Olimpico - Seville '),
(42, ' Molson Amphitheatre ', '2014-07-24 16:00:00', '2014-07-24 19:00:00', 'Details for  Molson Amphitheatre '),
(43, ' Bell Centre ', '2014-07-25 18:00:00', '2014-07-25 21:00:00', 'Details for  Bell Centre '),
(44, ' Nissan Pavilion ', '2014-07-28 17:00:00', '2014-07-28 20:00:00', 'Details for  Nissan Pavilion '),
(45, ' Comcast Center - MA (formerly Tweeter Center) ', '2014-07-31 12:00:00', '2014-07-31 15:00:00', 'Details for  Comcast Center - MA (formerly Tweeter Center) '),
(46, ' Borgata Hotel Casino & Spa ', '2014-08-01 15:00:00', '2014-08-01 18:00:00', 'Details for  Borgata Hotel Casino & Spa '),
(47, ' Madison Square Garden ', '2014-08-03 14:00:00', '2014-08-03 17:00:00', 'Details for  Madison Square Garden '),
(48, ' Madison Square Garden ', '2014-08-04 15:00:00', '2014-08-04 18:00:00', 'Details for  Madison Square Garden '),
(49, ' Key Arena ', '2014-08-10 16:00:00', '2014-08-10 19:00:00', 'Details for  Key Arena '),
(50, ' Shoreline Amphitheatre ', '2014-08-12 11:00:00', '2014-08-12 14:00:00', 'Details for  Shoreline Amphitheatre '),
(51, ' Cricket Wireless Amphitheatre ', '2014-08-14 19:00:00', '2014-08-14 22:00:00', 'Details for  Cricket Wireless Amphitheatre '),
(52, ' Hollywood Bowl ', '2014-08-16 17:00:00', '2014-08-16 20:00:00', 'Details for  Hollywood Bowl '),
(53, ' Hollywood Bowl ', '2014-08-17 13:00:00', '2014-08-17 16:00:00', 'Details for  Hollywood Bowl '),
(54, ' Honda Center ', '2014-08-19 17:00:00', '2014-08-19 20:00:00', 'Details for  Honda Center '),
(55, ' Santa Barbara Bowl ', '2014-08-20 16:00:00', '2014-08-20 19:00:00', 'Details for  Santa Barbara Bowl '),
(56, ' Palms Casino-the Pearl ', '2014-08-22 10:00:00', '2014-08-22 13:00:00', 'Details for  Palms Casino-the Pearl '),
(57, ' US Airways Center ', '2014-08-23 18:00:00', '2014-08-23 21:00:00', 'Details for  US Airways Center '),
(58, ' E Center ', '2014-08-25 15:00:00', '2014-08-25 18:00:00', 'Details for  E Center '),
(59, ' Red Rocks Amphitheatre ', '2014-08-27 18:00:00', '2014-08-27 21:00:00', 'Details for  Red Rocks Amphitheatre '),
(60, ' Superpages.com Center ', '2014-08-29 17:00:00', '2014-08-29 20:00:00', 'Details for  Superpages.com Center '),
(61, ' Cynthia Woods Mitchell Pavilion ', '2014-08-30 18:00:00', '2014-08-30 21:00:00', 'Details for  Cynthia Woods Mitchell Pavilion '),
(62, ' Lakewood Amphitheatre ', '2014-09-01 15:00:00', '2014-09-01 18:00:00', 'Details for  Lakewood Amphitheatre '),
(63, ' Ford Amphitheatre at the Florida State Fairgrounds ', '2014-09-04 10:00:00', '2014-09-04 13:00:00', 'Details for  Ford Amphitheatre at the Florida State Fairgrounds '),
(64, ' BankAtlantic Center ', '2014-09-05 13:00:00', '2014-09-05 16:00:00', 'Details for  BankAtlantic Center '),
(65, ' Konig Pilsener Arena ', '2014-10-31 17:00:00', '2014-10-31 20:00:00', 'Details for  Konig Pilsener Arena '),
(66, ' Awd Dome ', '2014-11-01 13:00:00', '2014-11-01 16:00:00', 'Details for  Awd Dome '),
(67, ' TUI Arena (formerly Preussag Arena) ', '2014-11-03 14:00:00', '2014-11-03 17:00:00', 'Details for  TUI Arena (formerly Preussag Arena) '),
(68, ' SAP Arena ', '2014-11-07 13:00:00', '2014-11-07 16:00:00', 'Details for  SAP Arena '),
(69, ' Schleyerhalle ', '2014-11-08 12:00:00', '2014-11-08 15:00:00', 'Details for  Schleyerhalle '),
(70, ' Stade De Geneve ', '2014-11-10 17:00:00', '2014-11-10 20:00:00', 'Details for  Stade De Geneve '),
(71, ' Recinto Ferial - Valencia ', '2014-11-12 15:00:00', '2014-11-12 18:00:00', 'Details for  Recinto Ferial - Valencia '),
(72, ' Palau Sant Jordi ', '2014-11-20 12:00:00', '2014-11-20 15:00:00', 'Details for  Palau Sant Jordi '),
(73, ' Halle Tony Garnier ', '2014-11-23 20:00:00', '2014-11-23 23:00:00', 'Details for  Halle Tony Garnier '),
(74, ' Arena Nurnberg ', '2014-12-01 13:00:00', '2014-12-01 16:00:00', 'Details for  Arena Nurnberg '),
(75, ' Stadthalle ', '2014-12-03 14:00:00', '2014-12-03 17:00:00', 'Details for  Stadthalle '),
(76, ' Stadthalle Graz ', '2014-12-04 13:00:00', '2014-12-04 16:00:00', 'Details for  Stadthalle Graz '),
(77, ' Hallenstadion ', '2014-12-06 16:00:00', '2014-12-06 19:00:00', 'Details for  Hallenstadion '),
(78, ' Hallenstadion ', '2014-12-07 10:00:00', '2014-12-07 13:00:00', 'Details for  Hallenstadion '),
(79, ' The O2 - Dublin ', '2014-12-10 17:00:00', '2014-12-10 20:00:00', 'Details for  The O2 - Dublin '),
(80, ' Scottish Exhibition & Conference Center ', '2014-12-12 14:00:00', '2014-12-12 17:00:00', 'Details for  Scottish Exhibition & Conference Center '),
(81, ' LG Arena ', '2014-12-13 15:00:00', '2014-12-13 18:00:00', 'Details for  LG Arena '),
(82, ' O2 Dome ', '2014-12-15 13:00:00', '2014-12-15 16:00:00', 'Details for  O2 Dome '),
(83, ' O2 Dome ', '2014-12-16 15:00:00', '2014-12-16 18:00:00', 'Details for  O2 Dome '),
(84, ' MEN Arena Manchester ', '2014-12-18 16:00:00', '2014-12-18 19:00:00', 'Details for  MEN Arena Manchester '),
(1261150491, 'International Horse Show', '2014-12-19 07:00:00', '2014-12-21 07:00:00', 'Olympia'),
(1261150492, 'Ladbrokes.com World Darts Championships (Evening session)', '2014-12-19 18:00:00', '2014-12-19 20:00:00', 'Alexandra Palace'),
(1261150493, 'Peter Pan', '2014-12-20 08:00:00', '2014-12-20 10:00:00', 'O2 Arena'),
(1261150494, 'Pet Shop Boys', '2014-12-21 08:00:00', '2014-12-21 10:00:00', 'O2 Arena'),
(1261150495, 'Wicked', '2014-12-22 06:00:00', '2014-12-22 08:00:00', 'Apollo Victoria Theatre'),
(1261150496, 'Ladbrokes.com World Darts Championships (Afternoon session)', '2014-12-23 15:00:00', '2014-12-25 15:00:00', 'Alexandra Palace'),
(1261150497, 'Calendar Girls', '2014-12-23 15:00:00', '2014-12-23 17:00:00', 'Noel Coward Theatre'),
(1261150498, 'Sister Act', '2014-12-24 14:00:00', '2014-12-24 16:00:00', 'Palladium'),
(1261150499, 'Dirty Dancing', '2014-12-26 18:00:00', '2014-12-26 20:00:00', 'Aldwych Theatre'),
(1261150500, 'Harlequins -  Wasps     Competition: Guinness Premiership', '2014-12-27 09:00:00', '2014-12-27 11:00:00', 'Twickenham Stadium'),
(1261150501, 'Peter Pan', '2014-12-28 07:00:00', '2014-12-30 07:00:00', 'O2 Arena'),
(1261150502, 'The Nutcracker', '2014-12-29 08:00:00', '2014-12-29 10:00:00', 'Coliseum'),
(1261150503, 'The Nutcracker', '2014-12-29 13:00:00', '2014-12-29 15:00:00', 'Coliseum'),
(1261150504, 'Peter Pan', '2014-12-30 15:00:00', '2014-12-30 17:00:00', 'O2 Arena'),
(1261150505, 'Legally Blonde The Musical', '2014-12-31 17:00:00', '2014-12-31 19:00:00', 'Savoy Theatre'),
(1261150506, 'Sister Act', '2015-01-01 18:00:00', '2015-01-03 18:00:00', 'Palladium'),
(1261150507, 'Cat On a Hot Tin Roof', '2015-01-02 07:00:00', '2015-01-02 09:00:00', 'Novello Theatre'),
(1261150508, 'Grease', '2015-01-02 07:00:00', '2015-01-02 09:00:00', 'Piccadilly Theatre'),
(1261150509, 'Ladbrokes.com World Darts Championships', '2015-01-03 17:00:00', '2015-01-03 19:00:00', 'Alexandra Palace'),
(1261150510, 'Calendar Girls', '2015-01-05 14:00:00', '2015-01-05 16:00:00', 'Noel Coward Theatre'),
(1261150511, 'Dirty Dancing', '2015-01-06 08:00:00', '2015-01-08 08:00:00', 'Aldwych Theatre'),
(1261150512, 'Cirque du Soleil Varekai', '2015-01-07 15:00:00', '2015-01-07 17:00:00', 'Royal Albert Hall'),
(1261150513, 'Grease', '2015-01-08 15:00:00', '2015-01-08 17:00:00', 'Piccadilly Theatre'),
(1261150514, 'The Lion King', '2015-01-09 09:00:00', '2015-01-09 11:00:00', 'Lyceum Theatre'),
(1261150515, 'Cirque du Soleil Varekai', '2015-01-09 07:00:00', '2015-01-09 09:00:00', 'Royal Albert Hall'),
(1261150516, 'Cirque du Soleil Varekai', '2015-01-10 10:00:00', '2015-01-12 10:00:00', 'Royal Albert Hall'),
(1261150517, 'Masters Snooker 2015      Afternoon session', '2015-01-12 09:00:00', '2015-01-12 11:00:00', 'Wembley Arena'),
(1261150518, 'The Lion King', '2015-01-13 10:00:00', '2015-01-13 12:00:00', 'Lyceum Theatre'),
(1261150519, 'Cirque du Soleil Varekai', '2015-01-13 13:00:00', '2015-01-13 15:00:00', 'Royal Albert Hall'),
(1261150520, 'Cat On a Hot Tin Roof', '2015-01-14 11:00:00', '2015-01-14 13:00:00', 'Novello Theatre'),
(1261150521, 'Cirque du Soleil Varekai', '2015-01-15 07:00:00', '2015-01-17 07:00:00', 'Royal Albert Hall'),
(1261150522, 'Ben Hur Live', '2015-01-16 07:00:00', '2015-01-16 09:00:00', 'O2 Arena    Not Available X'),
(1261150523, 'Billy Connolly', '2015-01-16 16:00:00', '2015-01-16 18:00:00', 'Hammersmith Apollo'),
(1261150524, 'Wicked', '2015-01-18 14:00:00', '2015-01-18 16:00:00', 'Apollo Victoria Theatre'),
(1261150525, 'Wicked', '2015-01-20 06:00:00', '2015-01-20 08:00:00', 'Apollo Victoria Theatre'),
(1261150526, 'Giselle', '2015-01-20 07:00:00', '2015-01-22 07:00:00', 'Coliseum'),
(1261150527, 'Giselle', '2015-01-21 12:00:00', '2015-01-21 14:00:00', 'Coliseum'),
(1261150528, 'Giselle', '2015-01-22 13:00:00', '2015-01-22 15:00:00', 'Coliseum'),
(1261150529, 'Billy Connolly', '2015-01-23 15:00:00', '2015-01-23 17:00:00', 'Hammersmith Apollo'),
(1261150530, 'Jersey Boys', '2015-01-24 11:00:00', '2015-01-24 13:00:00', 'Prince Edward Theatre'),
(1261150531, 'Dirty Dancing', '2015-01-26 18:00:00', '2015-01-28 18:00:00', 'Aldwych Theatre'),
(1261150532, 'Billy Elliot', '2015-01-27 16:00:00', '2015-01-27 18:00:00', 'Victoria Palace Theatre'),
(1261150533, 'Reel Big Fish', '2015-01-28 18:00:00', '2015-01-28 20:00:00', 'Koko'),
(1261150534, 'Jersey Boys', '2015-01-29 14:00:00', '2015-01-29 16:00:00', 'Prince Edward Theatre'),
(1261150535, 'West Ham  - Blackburn Rovers     Competition: Premier League', '2015-01-30 15:00:00', '2015-01-30 17:00:00', 'Craven Cottage'),
(1261150536, 'The Lion King', '2015-01-30 17:00:00', '2015-02-01 17:00:00', 'Lyceum Theatre'),
(1261150537, 'Legally Blonde The Musical', '2015-02-01 09:00:00', '2015-02-01 11:00:00', 'Savoy Theatre'),
(1261150538, 'Daniel Barenboim      + Berlin Staatskapelle', '2015-02-02 17:00:00', '2015-02-02 19:00:00', 'Royal Festival Hall'),
(1261150539, 'Cat On a Hot Tin Roof', '2015-02-03 09:00:00', '2015-02-03 11:00:00', 'Novello Theatre'),
(1261150540, 'Wicked', '2015-02-04 13:00:00', '2015-02-04 15:00:00', 'Apollo Victoria Theatre'),
(1261150541, 'Wicked', '2015-02-05 15:00:00', '2015-02-07 15:00:00', 'Apollo Victoria Theatre'),
(1261150542, 'Jersey Boys', '2015-02-06 15:00:00', '2015-02-06 17:00:00', 'Prince Edward Theatre'),
(1261150543, 'Cirque du Soleil Varekai', '2015-02-06 06:00:00', '2015-02-06 08:00:00', 'Royal Albert Hall'),
(1261150544, 'Wicked', '2015-02-08 08:00:00', '2015-02-08 10:00:00', 'Apollo Victoria Theatre'),
(1261150545, 'Wicked', '2015-02-10 14:00:00', '2015-02-10 16:00:00', 'Apollo Victoria Theatre'),
(1261150546, 'Cirque du Soleil Varekai', '2015-02-10 09:00:00', '2015-02-12 09:00:00', 'Royal Albert Hall'),
(1261150547, 'Cirque du Soleil Varekai', '2015-02-11 12:00:00', '2015-02-11 14:00:00', 'Royal Albert Hall'),
(1261150548, 'Cirque du Soleil Varekai', '2015-02-12 14:00:00', '2015-02-12 16:00:00', 'Royal Albert Hall'),
(1261150549, 'Billy Elliot', '2015-02-13 06:00:00', '2015-02-13 08:00:00', 'Victoria Palace Theatre'),
(1261150550, 'Ne-Yo', '2015-02-14 07:00:00', '2015-02-14 09:00:00', 'Wembley Arena'),
(1261150551, 'Dirty Dancing', '2015-02-16 08:00:00', '2015-02-18 08:00:00', 'Aldwych Theatre'),
(1261150552, 'Billy Elliot', '2015-02-17 08:00:00', '2015-02-17 10:00:00', 'Victoria Palace Theatre'),
(1261150553, 'Dirty Dancing', '2015-02-18 12:00:00', '2015-02-18 14:00:00', 'Aldwych Theatre'),
(1261150554, 'Dirty Dancing', '2015-02-19 09:00:00', '2015-02-19 11:00:00', 'Aldwych Theatre'),
(1261150555, 'Fulham - Birmingham City     Competition: Premier League', '2015-02-20 11:00:00', '2015-02-20 13:00:00', 'Craven Cottage'),
(1261150556, 'Legally Blonde The Musical', '2015-02-20 16:00:00', '2015-02-22 16:00:00', 'Savoy Theatre'),
(1261150557, 'Wicked', '2015-02-22 16:00:00', '2015-02-22 18:00:00', 'Apollo Victoria Theatre'),
(1261150558, 'Sister Act', '2015-02-24 11:00:00', '2015-02-24 13:00:00', 'Palladium'),
(1261150559, 'Legally Blonde The Musical', '2015-02-25 16:00:00', '2015-02-25 18:00:00', 'Savoy Theatre'),
(1261150560, 'Grease', '2015-02-26 15:00:00', '2015-02-26 17:00:00', 'Piccadilly Theatre'),
(1261150561, 'The Lion King', '2015-02-27 13:00:00', '2015-03-01 13:00:00', 'Lyceum Theatre'),
(1261150562, 'Cinderella On Ice', '2015-02-27 14:00:00', '2015-02-27 16:00:00', 'Royal Albert Hall'),
(1261150563, 'Legally Blonde The Musical', '2015-02-28 15:00:00', '2015-02-28 17:00:00', 'Savoy Theatre'),
(1261150564, 'Fulham - Stoke City     Competition: Premier League', '2015-03-06 16:00:00', '2015-03-06 18:00:00', 'Craven Cottage'),
(1261150565, 'The 69 Eyes', '2015-03-09 14:00:00', '2015-03-09 16:00:00', 'Carling Academy Islington'),
(1261150566, 'Sara Baras', '2015-03-13 13:00:00', '2015-03-15 13:00:00', 'Royal Albert Hall'),
(1261150567, 'Trivium', '2015-03-18 16:00:00', '2015-03-18 18:00:00', 'Koko'),
(1261150568, 'Love Never Dies', '2015-03-22 11:00:00', '2015-03-22 13:00:00', 'Adelphi Theatre'),
(1261150569, 'West Ham  - Stoke City     Competition: Premier League', '2015-03-27 14:00:00', '2015-03-27 16:00:00', 'Boleyn Ground'),
(1261150570, 'Swan Lake      Ballet Nacional de Cuba', '2015-03-31 08:00:00', '2015-03-31 10:00:00', 'Coliseum'),
(1261150571, 'Peter Andre', '2015-04-03 09:00:00', '2015-04-05 09:00:00', 'Hammersmith Apollo'),
(1261150572, 'Paolo Nutini', '2015-04-08 10:00:00', '2015-04-08 12:00:00', 'Royal Albert Hall'),
(1261150573, 'Love Never Dies', '2015-04-12 10:00:00', '2015-04-12 12:00:00', 'Adelphi Theatre'),
(1261150574, 'Dancing On Ice', '2015-04-17 08:00:00', '2015-04-17 10:00:00', 'O2 Arena'),
(1261150575, 'Love Never Dies', '2015-04-20 16:00:00', '2015-04-20 18:00:00', 'Adelphi Theatre'),
(1261150576, 'Love Never Dies', '2015-04-24 06:00:00', '2015-04-26 06:00:00', 'Adelphi Theatre'),
(1261150577, 'Deadmau5', '2015-04-30 11:00:00', '2015-04-30 13:00:00', 'Brixton Academy'),
(1261150578, 'Love Never Dies', '2015-05-06 14:00:00', '2015-05-06 16:00:00', 'Adelphi Theatre'),
(1261150579, 'Lee Mack', '2015-05-10 15:00:00', '2015-05-10 17:00:00', 'Hammersmith Apollo'),
(1261150580, 'Gotan Project', '2015-05-14 09:00:00', '2015-05-14 11:00:00', 'Brixton Academy'),
(1261150581, 'Love Never Dies', '2015-05-19 15:00:00', '2015-05-21 15:00:00', 'Adelphi Theatre'),
(1261150582, 'Love Never Dies', '2015-05-24 07:00:00', '2015-05-24 09:00:00', 'Adelphi Theatre'),
(1261150583, 'Guiness Premiership Final 2015     Competition: Guinness Premiership Final', '2015-05-29 14:00:00', '2015-05-29 16:00:00', 'Twickenham Stadium'),
(1261150584, 'Mark Knopfler', '2015-06-04 11:00:00', '2015-06-04 13:00:00', 'Royal Albert Hall'),
(1261150585, 'Swan Lake', '2015-06-11 15:00:00', '2015-06-11 17:00:00', 'Royal Albert Hall'),
(1261150586, 'Leona Lewis', '2015-06-18 15:00:00', '2015-06-20 15:00:00', 'O2 Arena'),
(1261150587, 'Wimbledon: 3rd Round (Centre Court)', '2015-06-26 17:00:00', '2015-06-26 19:00:00', 'All England Lawn Tennis Club'),
(1261150588, 'Placido Domingo', '2015-07-05 09:00:00', '2015-07-05 11:00:00', 'Royal Opera House'),
(1261150589, 'Pakistan v Australia 1st Test (Day 5)', '2015-07-17 11:00:00', '2015-07-17 13:00:00', 'Lords Cricket Ground'),
(1261150590, 'npower: England v Pakistan 3rd Test (Day 5)', '2015-08-22 07:00:00', '2015-08-22 09:00:00', 'Oval Cricket Ground'),
(1261150591, 'Level 42', '2015-10-23 06:00:00', '2015-10-25 06:00:00', 'Indigo2'),
(1261150592, 'Jason Manford', '2015-11-24 09:00:00', '2015-11-24 11:00:00', 'Hammersmith Apollo');


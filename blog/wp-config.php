<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'u383075534_blog');

/** MySQL database username */
define('DB_USER', 'u383075534_aep');

/** MySQL database password */
define('DB_PASSWORD', '43p543pud1n!');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '8Zgz^rN9Jb-/v=e%?Ow52:8:TU&Nxn _~aY$DkMo,Nu2QCV1d*f.2I>bKAGpnY?x');
define('SECURE_AUTH_KEY',  'pHPMAHQ<A~[DzC,P-e[6qs97Nr.Us1 gItfD!Dj5qN#4AmUD4xx/OI=wKJwlpTO^');
define('LOGGED_IN_KEY',    ' 8j=^m_r8!d/>]1g_1?[jaTZ/E(H2tIKAtH46|Ve$]QJlQ{Db=:3jE-(A&3V8=$^');
define('NONCE_KEY',        '4mPz!wp^hgl6v4YM:o%`N64=w5n9z%2%MbZY6Q[J0=7M&D%[1G(G-/Rnz}77Bc#z');
define('AUTH_SALT',        '04)*wL*Xm$6&OH<{)a#a5)9#j8^v5 &4R,(|(|kA2h|gzL45c 3.8u5J;tm Q-L3');
define('SECURE_AUTH_SALT', 'l>Q$f9b!(oII-7yIzoy*?vg2)&K5W?Awa h ~rx7`m+wjU(1gUzdP|qS]f{t|rb?');
define('LOGGED_IN_SALT',   't/9?|KyrJ* fm(VBWeUq%.|&><c+u 7<G;SyinSi~8|LQ1#q;XIX`YWLL*_!`81z');
define('NONCE_SALT',       'd7>gI`^6Gz$^}] :p1}dHMdy,}qy,i/~A~EM]sjz.2o({XiG*yCf.,WJh%y:=*E>');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_article';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');


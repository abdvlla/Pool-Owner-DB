const express = require('express')
const router = express.Router();
const Pool = require('../models/pool')
const Owner = require('../models/owner')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const uploadPath = path.join('public', Pool.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

// All Pools Route
router.get('/', ensureAuthenticated, async (req, res) => {
  let query = Pool.find().populate('owner');
  if (req.query.name != null && req.query.name != '') {
    query = query.regex('name', new RegExp(req.query.name, 'i'));
  }

  try {
    const pools = await query.exec();
    res.render('pools/index', {
      pools: pools,
      searchOptions: req.query
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});


router.get('/new', ensureAuthenticated, (req, res) => {
  renderNewPage(res, new Pool())
})

// Create Pool Route
router.post('/', ensureAuthenticated, upload.single('cover'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  const pool = new Pool({
    type: req.body.type,
    owner: req.body.owner,
    status: req.body.status,
    coverImageName: fileName,
    description: req.body.description
  })

  try {
    const newPool = await pool.save()
    res.redirect(`pools/${newPool.id}`)
  } catch {
    if (pool.coverImageName != null) {
      removePoolCover(pool.coverImageName)
    }
    renderNewPage(res, pool, true)
  }
})

// Show Pool Route
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
      .populate('owner')
      .exec()
    res.render('pools/show', { pool: pool })
  } catch {
    res.redirect('/')
  }
})

// Edit Pool Route
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
    renderEditPage(res, pool)
  } catch {
    res.redirect('/')
  }
})

router.put('/:id', ensureAuthenticated, upload.single('cover'), async (req, res) => {
  let pool;

  try {
    pool = await Pool.findById(req.params.id);
    pool.type = req.body.type;
    pool.owner = req.body.owner;
    pool.status = req.body.status;
    pool.description = req.body.description;
    
    if (req.file) {
      const fileName = req.file.filename;
      if (pool.coverImageName) {
        removePoolCover(pool.coverImageName); // Remove old cover image
      }
      pool.coverImageName = fileName; // Update cover image name
    }

    await pool.save();
    res.redirect(`/pools/${pool.id}`);
  } catch (err) {
    console.error(err);
    if (pool != null) {
      renderEditPage(res, pool, true);
    } else {
      res.redirect('/');
    }
  }
});


// Delete Pool Page
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id);

    if (pool.coverImageName) {
      removePoolCover(pool.coverImageName);
    }

    await pool.deleteOne();
    res.redirect('/pools');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

function removePoolCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
  })
}

async function renderEditPage(res, pool, hasError = false) {
  renderFormPage(res, pool, 'edit', hasError)
}

async function renderFormPage(res, pool, form, hasError = false) {
  try {
    const owners = await Owner.find({})
    const params = {
      owners: owners,
      pool: pool
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Pool'
      } else {
        params.errorMessage = 'Error Creating Pool'
      }
    }
    res.render(`pools/${form}`, params)
  } catch {
    res.redirect('/pools')
  }
}


module.exports = router;